// src/lib/calco.js — motor de Calco (imagen → SVG), sin dependencias.
// Port de Potrace (pathlist → calcLon → bestPolygon → adjustVertices → smooth →
// optiCurve) + cuantización k-means sobre un histograma de 15 bits para el modo color.
// Se copia tal cual desde el prototipo: no reescribir. Corre en un Web Worker
// (calco.worker.js) o, si no se puede crear, en el hilo principal.
//
// API: const core = coreFactory();
//      core.setImage(w, h, rgbaData);
//      core.trace(params) → { imgId, mode, layers: [{ d, paths, nodes, color }] }
// params: { imgId, mode: 'ink'|'color', thr, invert, n, turd, alphamax, opt, sx, sy }
// Las coordenadas se dividen entre sx/sy: el SVG sale con las medidas originales.

export function coreFactory(){
  var W=0,H=0,D=null,dark=null,quantCache={};

  function setImage(w,h,data){W=w;H=h;D=data;dark=null;quantCache={};}

  /* ---------- 1 tinta ---------- */
  function darkness(){
    if(dark)return dark;
    var N=W*H,i,a,l,trans=0,sum=0,op=0;
    var lum=new Uint8Array(N);
    for(i=0;i<N;i++){
      a=D[i*4+3];l=(D[i*4]*299+D[i*4+1]*587+D[i*4+2]*114)/1000;lum[i]=l;
      if(a<128)trans++;else{sum+=l;op++;}
    }
    var light=trans>N*0.05&&op>0&&sum/op>170;
    dark=new Uint8Array(N);
    for(i=0;i<N;i++){a=D[i*4+3];dark[i]=(light?lum[i]:255-lum[i])*a/255;}
    return dark;
  }

  /* ---------- cuantización ---------- */
  function quantize(n){
    if(quantCache[n])return quantCache[n];
    var N=W*H,B=32768,cnt=new Float64Array(B),sr=new Float64Array(B),sg=new Float64Array(B),sb=new Float64Array(B),i,j,k,bi;
    for(i=0;i<N;i++){
      if(D[i*4+3]<128)continue;
      bi=(D[i*4]>>3)<<10|(D[i*4+1]>>3)<<5|(D[i*4+2]>>3);
      cnt[bi]++;sr[bi]+=D[i*4];sg[bi]+=D[i*4+1];sb[bi]+=D[i*4+2];
    }
    var L=[];for(i=0;i<B;i++)if(cnt[i]>0)L.push(i);
    var m=L.length,c=new Float64Array(m),r=new Float64Array(m),g=new Float64Array(m),b=new Float64Array(m);
    for(i=0;i<m;i++){bi=L[i];c[i]=cnt[bi];r[i]=sr[bi]/c[i];g[i]=sg[bi]/c[i];b[i]=sb[bi]/c[i];}
    if(n>m)n=m;
    var cr=[],cg=[],cb=[],minD=new Float64Array(m),best=0,d;
    if(m){
      for(i=1;i<m;i++)if(c[i]>c[best])best=i;
      for(i=0;i<m;i++)minD[i]=Infinity;
      for(k=0;k<n;k++){
        cr.push(r[best]);cg.push(g[best]);cb.push(b[best]);
        var bs=-1,bv=-1;
        for(i=0;i<m;i++){
          d=(r[i]-cr[k])*(r[i]-cr[k])+(g[i]-cg[k])*(g[i]-cg[k])+(b[i]-cb[k])*(b[i]-cb[k]);
          if(d<minD[i])minD[i]=d;
          var sc=minD[i]*Math.sqrt(c[i]);
          if(sc>bv){bv=sc;bs=i;}
        }
        best=bs;
      }
    }
    var asg=new Int16Array(m);
    function assign(){
      for(var i=0;i<m;i++){
        var bd=Infinity,bk=0;
        for(var k=0;k<n;k++){
          var d=(r[i]-cr[k])*(r[i]-cr[k])+(g[i]-cg[k])*(g[i]-cg[k])+(b[i]-cb[k])*(b[i]-cb[k]);
          if(d<bd){bd=d;bk=k;}
        }
        asg[i]=bk;
      }
    }
    for(var it=0;it<12;it++){
      assign();
      var wr=new Float64Array(n),wg=new Float64Array(n),wb=new Float64Array(n),ww=new Float64Array(n);
      for(i=0;i<m;i++){k=asg[i];ww[k]+=c[i];wr[k]+=r[i]*c[i];wg[k]+=g[i]*c[i];wb[k]+=b[i]*c[i];}
      for(k=0;k<n;k++)if(ww[k]>0){cr[k]=wr[k]/ww[k];cg[k]=wg[k]/ww[k];cb[k]=wb[k]/ww[k];}
    }
    assign();
    var lut=new Int16Array(B).fill(-1),counts=new Float64Array(n);
    for(i=0;i<m;i++){lut[L[i]]=asg[i];counts[asg[i]]+=c[i];}
    var order=[];for(k=0;k<n;k++)order.push(k);
    order.sort(function(a,b){return counts[b]-counts[a];});
    var rank=new Int16Array(n);for(j=0;j<n;j++)rank[order[j]]=j;
    var rk=new Int16Array(N);
    for(i=0;i<N;i++){
      if(D[i*4+3]<128){rk[i]=-1;continue;}
      rk[i]=rank[lut[(D[i*4]>>3)<<10|(D[i*4+1]>>3)<<5|(D[i*4+2]>>3)]];
    }
    var colors=order.map(function(k){return [Math.round(cr[k]),Math.round(cg[k]),Math.round(cb[k])];});
    return quantCache[n]={rk:rk,colors:colors};
  }

  /* ---------- potrace ---------- */
  function P(x,y){this.x=x||0;this.y=y||0;}
  function mod(a,n){return a>=n?a%n:a>=0?a:n-1-(-1-a)%n;}
  function xprod(a,b){return a.x*b.y-a.y*b.x;}
  function cyclic(a,b,c){return a<=c?(a<=b&&b<c):(a<=b||b<c);}
  function sign(i){return i>0?1:i<0?-1:0;}
  function interval(l,a,b){return new P(a.x+l*(b.x-a.x),a.y+l*(b.y-a.y));}
  function ddenom(p0,p2){var ry=sign(p2.x-p0.x),rx=-sign(p2.y-p0.y);return ry*(p2.x-p0.x)-rx*(p2.y-p0.y);}
  function dpara(p0,p1,p2){return (p1.x-p0.x)*(p2.y-p0.y)-(p2.x-p0.x)*(p1.y-p0.y);}
  function cprod(p0,p1,p2,p3){return (p1.x-p0.x)*(p3.y-p2.y)-(p3.x-p2.x)*(p1.y-p0.y);}
  function iprod(p0,p1,p2){return (p1.x-p0.x)*(p2.x-p0.x)+(p1.y-p0.y)*(p2.y-p0.y);}
  function iprod1(p0,p1,p2,p3){return (p1.x-p0.x)*(p3.x-p2.x)+(p1.y-p0.y)*(p3.y-p2.y);}
  function ddist(p,q){return Math.sqrt((p.x-q.x)*(p.x-q.x)+(p.y-q.y)*(p.y-q.y));}
  function bezier(t,p0,p1,p2,p3){var s=1-t;return new P(s*s*s*p0.x+3*s*s*t*p1.x+3*t*t*s*p2.x+t*t*t*p3.x,s*s*s*p0.y+3*s*s*t*p1.y+3*t*t*s*p2.y+t*t*t*p3.y);}
  function tangent(p0,p1,p2,p3,q0,q1){
    var A=cprod(p0,p1,q0,q1),B=cprod(p1,p2,q0,q1),C=cprod(p2,p3,q0,q1),a=A-2*B+C,b=-2*A+2*B,c=A,d=b*b-4*a*c;
    if(a===0||d<0)return -1;
    var s=Math.sqrt(d),r1=(-b+s)/(2*a),r2=(-b-s)/(2*a);
    if(r1>=0&&r1<=1)return r1;if(r2>=0&&r2<=1)return r2;return -1;
  }
  function Curve(n){this.n=n;this.tag=new Array(n);this.c=new Array(n*3);this.vertex=new Array(n);this.alpha=new Array(n);this.alpha0=new Array(n);this.beta=new Array(n);}

  function pathlist(bm,w,h,turd){
    var bm1=new Int8Array(bm),size=w*h,list=[],cur=0;
    function at(d,x,y){return x>=0&&x<w&&y>=0&&y<h&&d[w*y+x]===1;}
    function majority(x,y){
      for(var i=2;i<5;i++){
        var ct=0;
        for(var a=-i+1;a<=i-1;a++){
          ct+=at(bm1,x+a,y+i-1)?1:-1;ct+=at(bm1,x+i-1,y+a-1)?1:-1;
          ct+=at(bm1,x+a-1,y-i)?1:-1;ct+=at(bm1,x-i,y+a)?1:-1;
        }
        if(ct>0)return 1;if(ct<0)return 0;
      }
      return 0;
    }
    function findPath(px,py){
      var p={pt:[],area:0,len:0,minX:1e9,minY:1e9,maxX:-1,maxY:-1,sign:at(bm,px,py)?"+":"-"};
      var x=px,y=py,dx=0,dy=1,tmp;
      while(1){
        p.pt.push(new P(x,y));
        if(x>p.maxX)p.maxX=x;if(x<p.minX)p.minX=x;if(y>p.maxY)p.maxY=y;if(y<p.minY)p.minY=y;
        p.len++;
        x+=dx;y+=dy;p.area-=x*dy;
        if(x===px&&y===py)break;
        var l=at(bm1,x+(dx+dy-1)/2,y+(dy-dx-1)/2),r=at(bm1,x+(dx-dy-1)/2,y+(dy+dx-1)/2);
        if(r&&!l){
          if(!majority(x,y)){tmp=dx;dx=-dy;dy=tmp;}else{tmp=dx;dx=dy;dy=-tmp;}
        }else if(r){tmp=dx;dx=-dy;dy=tmp;}
        else if(!l){tmp=dx;dx=dy;dy=-tmp;}
      }
      return p;
    }
    function xorPath(p){
      var y1=p.pt[0].y,len=p.len,x,y,minY,j,o;
      for(var i=1;i<len;i++){
        x=p.pt[i].x;y=p.pt[i].y;
        if(y!==y1){
          minY=y1<y?y1:y;o=w*minY;
          for(j=x;j<p.maxX;j++)bm1[o+j]=bm1[o+j]?0:1;
          y1=y;
        }
      }
    }
    while(1){
      while(cur<size&&bm1[cur]!==1)cur++;
      if(cur>=size)break;
      var p=findPath(cur%w,(cur/w)|0);
      xorPath(p);
      if(p.area>turd)list.push(p);
    }
    return list;
  }

  function calcSums(p){
    var n=p.len,pt=p.pt,x0=pt[0].x,y0=pt[0].y;
    p.x0=x0;p.y0=y0;
    var sx=new Float64Array(n+1),sy=new Float64Array(n+1),sxy=new Float64Array(n+1),sx2=new Float64Array(n+1),sy2=new Float64Array(n+1);
    for(var i=0;i<n;i++){
      var x=pt[i].x-x0,y=pt[i].y-y0;
      sx[i+1]=sx[i]+x;sy[i+1]=sy[i]+y;sxy[i+1]=sxy[i]+x*y;sx2[i+1]=sx2[i]+x*x;sy2[i+1]=sy2[i]+y*y;
    }
    p.s={x:sx,y:sy,xy:sxy,x2:sx2,y2:sy2};
  }

  function calcLon(p){
    var n=p.len,pt=p.pt,dir,pivk=new Int32Array(n),nc=new Int32Array(n),ct=[0,0,0,0],lon=new Int32Array(n);
    var c0=new P(),c1=new P(),cur=new P(),off=new P(),dk=new P(),foundk,i,j,k1,a,b,c,d,k=0;
    for(i=n-1;i>=0;i--){
      if(pt[i].x!=pt[k].x&&pt[i].y!=pt[k].y)k=i+1;
      nc[i]=k;
    }
    for(i=n-1;i>=0;i--){
      ct[0]=ct[1]=ct[2]=ct[3]=0;
      dir=(3+3*(pt[mod(i+1,n)].x-pt[i].x)+(pt[mod(i+1,n)].y-pt[i].y))/2;
      ct[dir]++;
      c0.x=0;c0.y=0;c1.x=0;c1.y=0;
      k=nc[i];k1=i;
      while(1){
        foundk=0;
        dir=(3+3*sign(pt[k].x-pt[k1].x)+sign(pt[k].y-pt[k1].y))/2;
        ct[dir]++;
        if(ct[0]&&ct[1]&&ct[2]&&ct[3]){pivk[i]=k1;foundk=1;break;}
        cur.x=pt[k].x-pt[i].x;cur.y=pt[k].y-pt[i].y;
        if(xprod(c0,cur)<0||xprod(c1,cur)>0)break;
        if(!(Math.abs(cur.x)<=1&&Math.abs(cur.y)<=1)){
          off.x=cur.x+((cur.y>=0&&(cur.y>0||cur.x<0))?1:-1);
          off.y=cur.y+((cur.x<=0&&(cur.x<0||cur.y<0))?1:-1);
          if(xprod(c0,off)>=0){c0.x=off.x;c0.y=off.y;}
          off.x=cur.x+((cur.y<=0&&(cur.y<0||cur.x<0))?1:-1);
          off.y=cur.y+((cur.x>=0&&(cur.x>0||cur.y<0))?1:-1);
          if(xprod(c1,off)<=0){c1.x=off.x;c1.y=off.y;}
        }
        k1=k;k=nc[k1];
        if(!cyclic(k,i,k1))break;
      }
      if(foundk===0){
        dk.x=sign(pt[k].x-pt[k1].x);dk.y=sign(pt[k].y-pt[k1].y);
        cur.x=pt[k1].x-pt[i].x;cur.y=pt[k1].y-pt[i].y;
        a=xprod(c0,cur);b=xprod(c0,dk);c=xprod(c1,cur);d=xprod(c1,dk);
        j=10000000;
        if(b<0)j=Math.floor(a/-b);
        if(d>0)j=Math.min(j,Math.floor(-c/d));
        pivk[i]=mod(k1+j,n);
      }
    }
    j=pivk[n-1];lon[n-1]=j;
    for(i=n-2;i>=0;i--){if(cyclic(i+1,pivk[i],j))j=pivk[i];lon[i]=j;}
    for(i=n-1;cyclic(mod(i+1,n),j,lon[i]);i--)lon[i]=j;
    p.lon=lon;
  }

  function penalty3(p,i,j){
    var n=p.len,pt=p.pt,s=p.s,x,y,xy,x2,y2,k,r=0;
    if(j>=n){j-=n;r=1;}
    if(r===0){x=s.x[j+1]-s.x[i];y=s.y[j+1]-s.y[i];x2=s.x2[j+1]-s.x2[i];xy=s.xy[j+1]-s.xy[i];y2=s.y2[j+1]-s.y2[i];k=j+1-i;}
    else{x=s.x[j+1]-s.x[i]+s.x[n];y=s.y[j+1]-s.y[i]+s.y[n];x2=s.x2[j+1]-s.x2[i]+s.x2[n];xy=s.xy[j+1]-s.xy[i]+s.xy[n];y2=s.y2[j+1]-s.y2[i]+s.y2[n];k=j+1-i+n;}
    var px=(pt[i].x+pt[j].x)/2-pt[0].x,py=(pt[i].y+pt[j].y)/2-pt[0].y,ey=pt[j].x-pt[i].x,ex=-(pt[j].y-pt[i].y);
    var a=(x2-2*x*px)/k+px*px,b=(xy-x*py-y*px)/k+px*py,c=(y2-2*y*py)/k+py*py;
    return Math.sqrt(ex*ex*a+2*ex*ey*b+ey*ey*c);
  }

  function bestPolygon(p){
    var i,j,m,k,n=p.len,pen=new Float64Array(n+1),prev=new Int32Array(n+1),clip0=new Int32Array(n),clip1=new Int32Array(n+1),seg0=new Int32Array(n+1),seg1=new Int32Array(n+1),tp,best,c;
    for(i=0;i<n;i++){
      c=mod(p.lon[mod(i-1,n)]-1,n);
      if(c==i)c=mod(i+1,n);
      clip0[i]=c<i?n:c;
    }
    j=1;
    for(i=0;i<n;i++)while(j<=clip0[i]){clip1[j]=i;j++;}
    i=0;
    for(j=0;i<n;j++){seg0[j]=i;i=clip0[i];}
    seg0[j]=n;m=j;
    i=n;
    for(j=m;j>0;j--){seg1[j]=i;i=clip1[i];}
    seg1[0]=0;pen[0]=0;
    for(j=1;j<=m;j++){
      for(i=seg1[j];i<=seg0[j];i++){
        best=-1;
        for(k=seg0[j-1];k>=clip1[i];k--){
          tp=penalty3(p,k,i)+pen[k];
          if(best<0||tp<best){prev[i]=k;best=tp;}
        }
        pen[i]=best;
      }
    }
    p.m=m;p.po=new Int32Array(m);
    for(i=n,j=m-1;i>0;j--){i=prev[i];p.po[j]=i;}
  }

  function pointslope(p,i,j,ctr,dir){
    var n=p.len,s=p.s,r=0,l;
    while(j>=n){j-=n;r+=1;}
    while(i>=n){i-=n;r-=1;}
    while(j<0){j+=n;r-=1;}
    while(i<0){i+=n;r+=1;}
    var x=s.x[j+1]-s.x[i]+r*s.x[n],y=s.y[j+1]-s.y[i]+r*s.y[n],x2=s.x2[j+1]-s.x2[i]+r*s.x2[n],xy=s.xy[j+1]-s.xy[i]+r*s.xy[n],y2=s.y2[j+1]-s.y2[i]+r*s.y2[n],k=j+1-i+r*n;
    ctr.x=x/k;ctr.y=y/k;
    var a=(x2-x*x/k)/k,b=(xy-x*y/k)/k,c=(y2-y*y/k)/k,l2=(a+c+Math.sqrt((a-c)*(a-c)+4*b*b))/2;
    a-=l2;c-=l2;
    if(Math.abs(a)>=Math.abs(c)){l=Math.sqrt(a*a+b*b);if(l!==0){dir.x=-b/l;dir.y=a/l;}}
    else{l=Math.sqrt(c*c+b*b);if(l!==0){dir.x=-c/l;dir.y=b/l;}}
    if(l===0){dir.x=dir.y=0;}
  }

  function quadform(Q,w){
    var v=[w.x,w.y,1],sum=0;
    for(var i=0;i<3;i++)for(var j=0;j<3;j++)sum+=v[i]*Q[i*3+j]*v[j];
    return sum;
  }

  function adjustVertices(p){
    var m=p.m,po=p.po,n=p.len,pt=p.pt,x0=p.x0,y0=p.y0,ctr=new Array(m),dir=new Array(m),q=new Array(m),v=[0,0,0],d,i,j,k,l,s=new P();
    p.curve=new Curve(m);
    for(i=0;i<m;i++){
      j=po[mod(i+1,m)];j=mod(j-po[i],n)+po[i];
      ctr[i]=new P();dir[i]=new P();
      pointslope(p,po[i],j,ctr[i],dir[i]);
    }
    for(i=0;i<m;i++){
      q[i]=[0,0,0,0,0,0,0,0,0];
      d=dir[i].x*dir[i].x+dir[i].y*dir[i].y;
      if(d!==0){
        v[0]=dir[i].y;v[1]=-dir[i].x;v[2]=-v[1]*ctr[i].y-v[0]*ctr[i].x;
        for(l=0;l<3;l++)for(k=0;k<3;k++)q[i][l*3+k]=v[l]*v[k]/d;
      }
    }
    var Q,w,dx,dy,det,min,cand,xmin,ymin,z;
    for(i=0;i<m;i++){
      Q=new Array(9);w=new P();
      s.x=pt[po[i]].x-x0;s.y=pt[po[i]].y-y0;
      j=mod(i-1,m);
      for(l=0;l<9;l++)Q[l]=q[j][l]+q[i][l];
      while(1){
        det=Q[0]*Q[4]-Q[1]*Q[3];
        if(det!==0){
          w.x=(-Q[2]*Q[4]+Q[5]*Q[1])/det;
          w.y=(Q[2]*Q[3]-Q[5]*Q[0])/det;
          break;
        }
        if(Q[0]>Q[4]){v[0]=-Q[1];v[1]=Q[0];}
        else if(Q[4]){v[0]=-Q[4];v[1]=Q[3];}
        else{v[0]=1;v[1]=0;}
        d=v[0]*v[0]+v[1]*v[1];
        v[2]=-v[1]*s.y-v[0]*s.x;
        for(l=0;l<3;l++)for(k=0;k<3;k++)Q[l*3+k]+=v[l]*v[k]/d;
      }
      dx=Math.abs(w.x-s.x);dy=Math.abs(w.y-s.y);
      if(dx<=0.5&&dy<=0.5){p.curve.vertex[i]=new P(w.x+x0,w.y+y0);continue;}
      min=quadform(Q,s);xmin=s.x;ymin=s.y;
      if(Q[0]!==0){
        for(z=0;z<2;z++){
          w.y=s.y-0.5+z;w.x=-(Q[1]*w.y+Q[2])/Q[0];
          dx=Math.abs(w.x-s.x);cand=quadform(Q,w);
          if(dx<=0.5&&cand<min){min=cand;xmin=w.x;ymin=w.y;}
        }
      }
      if(Q[4]!==0){
        for(z=0;z<2;z++){
          w.x=s.x-0.5+z;w.y=-(Q[3]*w.x+Q[5])/Q[4];
          dy=Math.abs(w.y-s.y);cand=quadform(Q,w);
          if(dy<=0.5&&cand<min){min=cand;xmin=w.x;ymin=w.y;}
        }
      }
      for(l=0;l<2;l++)for(k=0;k<2;k++){
        w.x=s.x-0.5+l;w.y=s.y-0.5+k;cand=quadform(Q,w);
        if(cand<min){min=cand;xmin=w.x;ymin=w.y;}
      }
      p.curve.vertex[i]=new P(xmin+x0,ymin+y0);
    }
  }

  function smooth(p,alphamax){
    var cv=p.curve,m=cv.n,i,j,k,dd,denom,alpha,p4;
    for(i=0;i<m;i++){
      j=mod(i+1,m);k=mod(i+2,m);
      p4=interval(0.5,cv.vertex[k],cv.vertex[j]);
      denom=ddenom(cv.vertex[i],cv.vertex[k]);
      if(denom!==0){
        dd=Math.abs(dpara(cv.vertex[i],cv.vertex[j],cv.vertex[k])/denom);
        alpha=(dd>1?1-1/dd:0)/0.75;
      }else alpha=4/3;
      cv.alpha0[j]=alpha;
      if(alpha>=alphamax){
        cv.tag[j]=0;cv.c[3*j+1]=cv.vertex[j];cv.c[3*j+2]=p4;
      }else{
        if(alpha<0.55)alpha=0.55;else if(alpha>1)alpha=1;
        cv.tag[j]=1;
        cv.c[3*j]=interval(0.5+0.5*alpha,cv.vertex[i],cv.vertex[j]);
        cv.c[3*j+1]=interval(0.5+0.5*alpha,cv.vertex[k],cv.vertex[j]);
        cv.c[3*j+2]=p4;
      }
      cv.alpha[j]=alpha;cv.beta[j]=0.5;
    }
  }

  function optiPenalty(p,i,j,res,tol,convc,areac){
    var cv=p.curve,m=cv.n,vx=cv.vertex,k,k1,k2,conv,i1,area,alpha,d,d1,d2,p0,p1,p2,p3,pt,A,R,A1,A2,A3,A4,s,t;
    if(i==j)return 1;
    k=i;i1=mod(i+1,m);k1=mod(k+1,m);
    conv=convc[k1];
    if(conv===0)return 1;
    d=ddist(vx[i],vx[i1]);
    for(k=k1;k!=j;k=k1){
      k1=mod(k+1,m);k2=mod(k+2,m);
      if(convc[k1]!=conv)return 1;
      if(sign(cprod(vx[i],vx[i1],vx[k1],vx[k2]))!=conv)return 1;
      if(iprod1(vx[i],vx[i1],vx[k1],vx[k2])<d*ddist(vx[k1],vx[k2])*-0.999847695156)return 1;
    }
    p0=cv.c[mod(i,m)*3+2];p1=vx[mod(i+1,m)];p2=vx[mod(j,m)];p3=cv.c[mod(j,m)*3+2];
    area=areac[j]-areac[i];
    area-=dpara(vx[0],cv.c[i*3+2],cv.c[j*3+2])/2;
    if(i>=j)area+=areac[m];
    A1=dpara(p0,p1,p2);A2=dpara(p0,p1,p3);A3=dpara(p0,p2,p3);A4=A1+A3-A2;
    if(A2==A1)return 1;
    t=A3/(A3-A4);s=A2/(A2-A1);A=A2*t/2;
    if(A===0)return 1;
    R=area/A;alpha=2-Math.sqrt(4-R/0.3);
    res.c0=interval(t*alpha,p0,p1);res.c1=interval(s*alpha,p3,p2);
    res.alpha=alpha;res.t=t;res.s=s;
    p1=res.c0;p2=res.c1;
    res.pen=0;
    for(k=mod(i+1,m);k!=j;k=k1){
      k1=mod(k+1,m);
      t=tangent(p0,p1,p2,p3,vx[k],vx[k1]);
      if(!(t>=-0.5))return 1;
      pt=bezier(t,p0,p1,p2,p3);
      d=ddist(vx[k],vx[k1]);
      if(d===0)return 1;
      d1=dpara(vx[k],vx[k1],pt)/d;
      if(!(Math.abs(d1)<=tol))return 1;
      if(iprod(vx[k],vx[k1],pt)<0||iprod(vx[k1],vx[k],pt)<0)return 1;
      res.pen+=d1*d1;
    }
    for(k=i;k!=j;k=k1){
      k1=mod(k+1,m);
      t=tangent(p0,p1,p2,p3,cv.c[k*3+2],cv.c[k1*3+2]);
      if(!(t>=-0.5))return 1;
      pt=bezier(t,p0,p1,p2,p3);
      d=ddist(cv.c[k*3+2],cv.c[k1*3+2]);
      if(d===0)return 1;
      d1=dpara(cv.c[k*3+2],cv.c[k1*3+2],pt)/d;
      d2=dpara(cv.c[k*3+2],cv.c[k1*3+2],vx[k1])/d;
      d2*=0.75*cv.alpha[k1];
      if(d2<0){d1=-d1;d2=-d2;}
      if(d1<d2-tol)return 1;
      if(d1<d2)res.pen+=(d1-d2)*(d1-d2);
    }
    return 0;
  }

  function optiCurve(p,tol){
    var cv=p.curve,m=cv.n,vx=cv.vertex,pt=new Int32Array(m+1),pen=new Float64Array(m+1),len=new Int32Array(m+1),opt=new Array(m+1),om,i,j,r,o={},p0,i1,area,alpha,oc,s,t;
    var convc=new Int8Array(m),areac=new Float64Array(m+1);
    for(i=0;i<m;i++)convc[i]=cv.tag[i]===1?sign(dpara(vx[mod(i-1,m)],vx[i],vx[mod(i+1,m)])):0;
    area=0;p0=vx[0];
    for(i=0;i<m;i++){
      i1=mod(i+1,m);
      if(cv.tag[i1]===1){
        alpha=cv.alpha[i1];
        area+=0.3*alpha*(4-alpha)*dpara(cv.c[i*3+2],vx[i1],cv.c[i1*3+2])/2;
        area+=dpara(p0,cv.c[i*3+2],cv.c[i1*3+2])/2;
      }
      areac[i+1]=area;
    }
    pt[0]=-1;
    for(j=1;j<=m;j++){
      pt[j]=j-1;pen[j]=pen[j-1];len[j]=len[j-1]+1;
      for(i=j-2;i>=0;i--){
        r=optiPenalty(p,i,mod(j,m),o,tol,convc,areac);
        if(r)break;
        if(len[j]>len[i]+1||(len[j]==len[i]+1&&pen[j]>pen[i]+o.pen)){
          pt[j]=i;pen[j]=pen[i]+o.pen;len[j]=len[i]+1;opt[j]=o;o={};
        }
      }
    }
    om=len[m];oc=new Curve(om);s=new Array(om);t=new Array(om);
    j=m;
    for(i=om-1;i>=0;i--){
      var jm=mod(j,m);
      if(pt[j]==j-1){
        oc.tag[i]=cv.tag[jm];
        oc.c[i*3]=cv.c[jm*3];oc.c[i*3+1]=cv.c[jm*3+1];oc.c[i*3+2]=cv.c[jm*3+2];
        oc.vertex[i]=vx[jm];oc.alpha[i]=cv.alpha[jm];
        s[i]=t[i]=1;
      }else{
        oc.tag[i]=1;
        oc.c[i*3]=opt[j].c0;oc.c[i*3+1]=opt[j].c1;oc.c[i*3+2]=cv.c[jm*3+2];
        oc.vertex[i]=interval(opt[j].s,cv.c[jm*3+2],vx[jm]);
        oc.alpha[i]=opt[j].alpha;
        s[i]=opt[j].s;t[i]=opt[j].t;
      }
      j=pt[j];
    }
    p.curve=oc;
  }

  function traceBitmap(bm,w,h,o){
    var list=pathlist(bm,w,h,o.turd),d="",nodes=0,ix=1/o.sx,iy=1/o.sy;
    function f(pt){return (+(pt.x*ix).toFixed(2))+" "+(+(pt.y*iy).toFixed(2));}
    for(var q=0;q<list.length;q++){
      var p=list[q];
      calcSums(p);calcLon(p);bestPolygon(p);adjustVertices(p);
      smooth(p,o.alphamax);
      if(o.opt>0)optiCurve(p,o.opt);
      var cv=p.curve,n=cv.n;
      d+="M"+f(cv.c[(n-1)*3+2]);
      for(var i=0;i<n;i++){
        if(cv.tag[i]===1)d+="C"+f(cv.c[i*3])+" "+f(cv.c[i*3+1])+" "+f(cv.c[i*3+2]);
        else d+="L"+f(cv.c[i*3+1])+" "+f(cv.c[i*3+2]);
      }
      d+="Z";nodes+=n;
    }
    return {d:d,paths:list.length,nodes:nodes};
  }

  function trace(o){
    var N=W*H,bm=new Int8Array(N),i,layers=[];
    if(o.mode==="ink"){
      var dk=darkness(),lim=255-o.thr;
      for(i=0;i<N;i++)bm[i]=((dk[i]>lim)!==o.invert)?1:0;
      var r=traceBitmap(bm,W,H,o);r.color=null;layers.push(r);
    }else{
      var q=quantize(o.n);
      for(var k=0;k<q.colors.length;k++){
        for(i=0;i<N;i++)bm[i]=q.rk[i]>=k?1:0;
        var r2=traceBitmap(bm,W,H,o);r2.color=q.colors[k];layers.push(r2);
      }
    }
    return {imgId:o.imgId,mode:o.mode,layers:layers};
  }

  return {setImage:setImage,trace:trace};
}
