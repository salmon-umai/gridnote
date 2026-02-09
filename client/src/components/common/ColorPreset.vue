<script setup lang="js">
import { ref, nextTick } from 'vue';

const props = defineProps({
    modelValue: String, //選択中の色
    preset: Array, //プリセット色配列
    customDefault: { // その他の初期色を設定できる
    type: String,
    default: "#cccccc"
  }
});

const emit = defineEmits(["update:modelValue"]);
//update:modelVslue:
// 子コンポーネントからv-modelの値が変わったと親へ知らせるためのイベント。
const showPicker = ref(false);
//「その他」で選んだ色だけ保持する
const customColor = ref(props.customDefault);


//選択カラー
const selectColor = (color) => {
    emit("update:modelValue", color);
    showPicker.value = false; //カラーピッカーをその他以外で開かないように
};
// その他選択 → modelValue と customColor 両方更新
const selectCustom = (color) => {
  customColor.value = color;
  emit("update:modelValue", color);
};

//カラーピッカー１度クリック
const pickerEl = ref(null);
const openPicker = () => {
    showPicker.value = true;
    nextTick(() => {
        pickerEl.value?.click();
    });
};
</script>

<template>
    <div class="color-palette">
        <div v-for="color in preset" :key="color"
        class="color-circle"
        :style="{ 
            background: color,
            border: modelValue === color ? '2px solid #333' : '1px solid #ccc'
            //選択されている色なら太い枠、それ以外なら細い枠 三項演算子
            }"
            @click="selectColor(color)">

            
        </div>

        <!--その他-->
        <div class="color-circle custom"
        @click="openPicker"
        :style="{ background: customColor }">
        
        +
            <input 
            type="color" 
            :value="customColor" class="picker"
            @input="selectCustom($event.target.value)">
            </input>
        </div>
        

    </div>

</template>

<style scoped>
.color-palette {
    display: flex;
    gap: 10px;
    cursor: pointer;
    position: relative;
}

.color-circle.custom {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 16px;
}

.picker {
    position: absolute;
    opacity: 0;
    width: 28px;
    height: 28px;
    cursor: pointer;
    z-index: 9999;
    inset: 0;
}

.color-circle {
    border-radius: 50%;
    width: 24px;
    height: 24px;
    border: 2px solid #ccc;
    box-sizing: border-box;
}


</style>