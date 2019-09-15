<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  padding: 0;
 
}
#starfield {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: absolute;
}
.pureblack {
  background: #000;
}
.blacknight {
  background: linear-gradient(160deg, #010101, #010111, #010122);
}
.darknight {
  background: linear-gradient(160deg, #030c20, #121b39, #2d4065);
}
.lightnight {
  background: linear-gradient(160deg, #141d30, #232c4a, #3e5176);
}
.twilight {
  background: linear-gradient(160deg, #25273a, #2e3755, #485b80);
}
.star {
  position: absolute;
  background: #fbfbfc;
  border-radius: 100%;
  height: 1px;
  width: 1px;
  top: calc(var(--y) * 1vh);
  left: calc(var(--x) * 1vw);
  transform: scale(var(--scale));
}
.pureblack .star {
  opacity: calc(var(--opacity) * 1.7);
}
.blacknight .star {
  opacity: calc(var(--opacity) * 1.6);
}
.darknight .star {
  opacity: calc(var(--opacity) * 1.5);
}
.lightnight .star {
  opacity: calc(var(--opacity) * 1);
}
.twilight .star {
  opacity: calc(var(--opacity) * 0.35);
}
</style>
<template>
  <div
    id="starfield"
    class="darknight"
  ></div>
</template>
<script>
export default {
  data() {
    return {
      bgclasses: [
        "twilight",
        "lightnight",
        "darknight",
        "blacknight",
        "pureblack"
      ],
      starcount: 1000,
      darkness: 2
    };
  },
  mounted(){
      this.makeStars();
  },
  methods: {
    makeStars: function() {
      let html = "";
      for (let i = 0; i < this.starcount; i++) {
        let x = this.randRange(1, 1000) / 10;
        let y = this.randRange(1, 1000) / 10;
        let op = this.randRange(2, 5) / 10;
        let s = this.randRange(100, 300) / 100;
        html += `<div class="star" style="--x:${x}; --y:${y}; --opacity:${op}; --scale:${s};"></div>`;
      }
      this.darkness = this.darkness >= this.bgclasses.length ? 4 : this.darkness < 0 ? 0 : this.darkness;
      document.getElementById("starfield").className = this.bgclasses[this.darkness];
      document.getElementById("starfield").innerHTML = html;
    },
    randRange: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }
};
</script>
