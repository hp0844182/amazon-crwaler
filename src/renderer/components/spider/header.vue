<style lang="scss">
.header {
  height: 100px;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  div {
    z-index: 100;
  }
  .header-tool {
    display: flex;
    justify-content: space-between;

    div {
      width: 200px;
      height: 50px;;
      border-radius: 5px;
      margin-left: 20px;
      box-shadow:0 0 5px #2185d0;
      .ant-checkbox-wrapper {
        span {
          color: #fff;
        }
      }
    }
    .filter-type {
      background: #2185d0;
      color: #fff;
      text-align: center;
      line-height: 50px;
    }
    .shop-type {
      background: #21ba45;
    }
  }
}
</style>

 
<template>
  <div
    class="header"
    id=""
  >
    <HeaderBack />
    <div class="header-tool">
      <div class="filter-type">
        亚马逊商品采集
      </div>
      <!-- <div class="shop-type"></div> -->
    </div>
  </div>
</template>
<script>
import HeaderBack from "./headerback";
const options = [
  { label: "Apple", value: "Apple" },
  { label: "Pear", value: "Pear" },
  { label: "Orange", value: "Orange" }
];
export default {
  data() {
    return {
      options,
      value: []
    };
  },
  methods: {
    onChange: function(val) {
      console.log(val);
    }
  },
  components: {
    HeaderBack
  }
};
</script>
