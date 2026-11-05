(function(){
  var cats=["Housing","Food","Transport","Utilities & bills","Lifestyle","Debt payments"];
  var cols=["#1f7a5c","#c8833a","#4a7fb5","#8a6bb0","#b9453a","#7d8a84"];
  var $=function(id){return document.getElementById(id)};
  var num=function(id){var v=parseFloat($(id).value);return isFinite(v)?v:0};
  var fmt=function(n){var s=Math.abs(Math.round(n)).toLocaleString("en-US");return (n<0?"-":"")+"$"+s};
  var short=function(n){var a=Math.abs(n);return (n<0?"-":"")+"$"+(a>=1e6?(a/1e6).toFixed(1)+"M":a>=1e3?Math.round(a/1e3)+"k":Math.round(a))};

  function run(){
    var Y=num("years");$("yv").textContent=Y;
    var inc=num("income")*12,ig=num("ig")/100,ret=num("ret")/100,inf=num("inf")/100,bal=num("start");
    var exp=[];for(var i=0;i<6;i++)exp.push(num("e"+i)*12);
    var rows=[],tot0=exp.reduce(function(a,b){return a+b},0);
    var saved=0;
    for(var y=1;y<=Y;y++){
      var income=inc*Math.pow(1+ig,y-1);
      var spend=tot0*Math.pow(1+inf,y-1);
      var sur=income-spend;
      bal=bal*(1+ret)+sur*(1+ret/2);
      saved+=sur;
      rows.push({y:y,inc:income,sp:spend,sur:sur,bal:bal,real:bal/Math.pow(1+inf,y)});
    }
    var last=rows[rows.length-1],first=rows[0];
    var rate=inc>0?first.sur/inc*100:0;
    var kp=[
      ["Projected balance",fmt(last.bal),"in "+Y+" years (nominal)"],
      ["In today’s money",fmt(last.real),"after inflation"],
      ["Year-1 surplus",fmt(first.sur),fmt(first.sur/12)+" per month"],
      ["Savings rate",rate.toFixed(1)+"%",rate>=20?"On track (20%+ target)":"Below the 20% target"]
    ];
    $("kpis").innerHTML=kp.map(function(k,i){return '<div class="card kpi"><div class="l">'+k[0]+'</div><div class="v'+(i==2&&first.sur<0?' neg':'')+'">'+k[1]+'</div><div class="n">'+k[2]+'</div></div>'}).join("");
    chart(rows);
    var tot=tot0+Math.max(first.sur,0);
    var parts=exp.map(function(e,i){return {n:cats[i],v:e,c:cols[i]}});
    parts.push({n:"Savings",v:Math.max(first.sur,0),c:"#2fa37a"});
    $("bar").innerHTML=parts.map(function(p){return '<div title="'+p.n+'" style="width:'+(tot>0?p.v/tot*100:0)+'%;background:'+p.c+'"></div>'}).join("");
    $("split").innerHTML=parts.map(function(p){return '<div class="row"><span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:'+p.c+';margin-right:8px"></i>'+p.n+'</span><b>'+fmt(p.v/12)+'/mo · '+(tot>0?(p.v/tot*100).toFixed(0):0)+'%</b></div>'}).join("");
    $("tbl").innerHTML='<thead><tr><th>Year</th><th>Income</th><th>Spending</th><th>Surplus</th><th>Balance</th><th>Real balance</th></tr></thead><tbody>'+rows.map(function(r){return '<tr><td>'+r.y+'</td><td>'+fmt(r.inc)+'</td><td>'+fmt(r.sp)+'</td><td'+(r.sur<0?' class="neg"':'')+'>'+fmt(r.sur)+'</td><td>'+fmt(r.bal)+'</td><td>'+fmt(r.real)+'</td></tr>'}).join("")+'</tbody>';
  }

  function chart(rows){
    var W=640,H=280,L=52,R=12,T=12,B=28;
    var vals=[0];rows.forEach(function(r){vals.push(r.bal,r.real)});
    var mx=Math.max.apply(null,vals),mn=Math.min.apply(null,vals);
    if(mx===mn)mx=mn+1;
    var n=rows.length,x=function(i){return L+(n>1?i/(n-1):0)*(W-L-R)},yy=function(v){return T+(1-(v-mn)/(mx-mn))*(H-T-B)};
    var g="";
    for(var t=0;t<=4;t++){var v=mn+(mx-mn)*t/4,py=yy(v);g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+py+'" y2="'+py+'" stroke="var(--line)"/><text x="'+(L-6)+'" y="'+(py+4)+'" text-anchor="end" font-size="11" fill="var(--mute)">'+short(v)+'</text>'}
    var step=Math.max(1,Math.ceil(n/8));
    rows.forEach(function(r,i){if(i%step===0||i===n-1)g+='<text x="'+x(i)+'" y="'+(H-8)+'" text-anchor="middle" font-size="11" fill="var(--mute)">Y'+r.y+'</text>'});
    var line=function(k){return rows.map(function(r,i){return (i?"L":"M")+x(i).toFixed(1)+" "+yy(r[k]).toFixed(1)}).join(" ")};
    var area=line("bal")+" L"+x(n-1)+" "+yy(Math.max(mn,0))+" L"+x(0)+" "+yy(Math.max(mn,0))+" Z";
    $("chart").innerHTML='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Projected savings balance over time">'+g+'<path d="'+area+'" fill="var(--c1)" opacity=".12"/><path d="'+line("bal")+'" fill="none" stroke="var(--c1)" stroke-width="2.5"/><path d="'+line("real")+'" fill="none" stroke="var(--c2)" stroke-width="2.5" stroke-dasharray="5 4"/></svg>';
  }

  document.querySelectorAll("input").forEach(function(el){el.addEventListener("input",run)});
  run();
})();
