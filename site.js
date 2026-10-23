'use strict';
(() => {
  const hero=document.querySelector('.hero');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const pointer=matchMedia('(hover: hover) and (min-width: 801px)');
  let heroVisible=false;
  let frame=0;
  let point=null;
  const resetHero=()=>{
    if(frame) cancelAnimationFrame(frame);
    frame=0;point=null;
    if(hero){hero.style.removeProperty('--hero-x');hero.style.removeProperty('--hero-y');}
  };
  if(hero && 'IntersectionObserver' in window){
    new IntersectionObserver(entries=>{
      heroVisible=entries[0].isIntersecting;
      hero.dataset.active=String(heroVisible && !document.hidden && !reduced.matches);
      if(!heroVisible)resetHero();
    },{threshold:0}).observe(hero);
    hero.addEventListener('pointermove',e=>{
      if(!heroVisible || document.hidden || reduced.matches || !pointer.matches)return;
      point={x:e.clientX,y:e.clientY};
      if(frame)return;
      frame=requestAnimationFrame(()=>{
        frame=0;
        if(!point || reduced.matches || !pointer.matches || !heroVisible)return;
        const r=hero.getBoundingClientRect();
        hero.style.setProperty('--hero-x',(((point.x-r.left)/r.width-.5)*10).toFixed(2)+'px');
        hero.style.setProperty('--hero-y',(((point.y-r.top)/r.height-.5)*6).toFixed(2)+'px');
      });
    },{passive:true});
    hero.addEventListener('pointerleave',resetHero,{passive:true});
  }
  const visibility=()=>{
    if(hero)hero.dataset.active=String(heroVisible && !document.hidden && !reduced.matches);
    if(document.hidden || reduced.matches || !pointer.matches)resetHero();
  };
  document.addEventListener('visibilitychange',visibility);
  reduced.addEventListener('change',visibility);
  pointer.addEventListener('change',visibility);
  if('IntersectionObserver' in window && !reduced.matches){
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}
    },{threshold:.05,rootMargin:'0px 0px 30px 0px'});
    document.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));
    document.documentElement.classList.add('motion-ready');
  }
  const video=document.getElementById('demo-video');
  const play=document.getElementById('demo-play');
  const box=document.querySelector('.demo-frame');
  if(video && play && box){
    play.hidden=false;
    play.addEventListener('click',()=>{
      video.play().then(()=>video.focus({preventScroll:true})).catch(()=>video.focus({preventScroll:true}));
    });
    video.addEventListener('play',()=>{box.classList.add('is-playing');play.hidden=true;});
    video.addEventListener('pause',()=>{box.classList.remove('is-playing');play.hidden=false;});
    video.addEventListener('ended',()=>{box.classList.remove('is-playing');play.hidden=false;});
    video.addEventListener('error',()=>{play.hidden=true;});
  }
})();
