<script setup lang="js">
import { readonly, ref } from 'vue';

//画像読み込み
import starOn from "@/assets/img/star-on.svg";
import starOff from "@/assets/img/star-off.svg";


const props = defineProps({
    modelValue: Number,
    readonly: Boolean
});

const emit = defineEmits(["update:modelValue"]);

const stars = ref([1, 2, 3, 4, 5]);

//hover用
const hoverValue = ref(0);

const setRating = (val) => {
    if(props.readonly) return; //読み取り専用ならクリック無効
    emit("update:modelValue", val);
};

const setHover = (val) => {
    if(props.readonly) return; //読み取り専用ならhover無効
    hoverValue.value = val;
};


</script>

<template>
    <div class="star-rating">
        <img
        v-for="star in stars" :key="star"
        :src="(hoverValue >= star || props.modelValue >= star)
         ? starOn
         : starOff"
         class="star"
         @mouseover="setHover(star)"
         @mouseleave="setHover(0)"
         @click="console.log('選択した星：', star); setRating(star)"></img>
         <!--
         (hoverValue >= star || props.modelValue >= star):
         マウスで触ってる星以上、または
        現在の評価（modelValue）以上の星なら塗る
        hoverValue … マウスで触れている星の番号
        modelValue … 実際に評価として選ばれている星の番号
        star … 今表示している星（1〜5）
        -->

    </div>

</template>

<style scoped>
.star-rating {
  display: flex;
  gap: 6px;
  cursor: pointer;
}

.star {
  width: 28px;
  height: 28px;
  cursor: pointer;
}
</style>