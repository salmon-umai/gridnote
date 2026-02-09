<script setup lang="js">
import { defineProps, defineEmits } from 'vue';

const emit = defineEmits(["close"]);
//emit:子コンポーネント⇒親コンポーネントへ合図を送る仕組み
//defineEmits:このコンポーネントが外へ発行するイベントを定義する関数
const close = () => emit("close");
//closeという合図を送る（@close)⇒open=falseになるから閉じるという感じ

//OKで閉じる
const props = defineProps({
    show: Boolean
});

</script>

<template>
    <div class="overlay" @click.self="close"
     v-if="show">
     <!--show が false のときはモーダル非表示
     アカウント登録のため必要->
        <!--self:の要素自身がクリックされたときだけ反応させる
        ⇒子要素では反応しない⇒真ん中の白背景は子要素で
        それをクリックしても閉じないようにするため-->
        <div class="model">
            <button class="close-btn" @click="close">×</button>
            <header class="model-header">
                <slot name="header"></slot>
            </header>

            <div class="model-body">
                <slot></slot>
            </div>

            <footer class="model-footer">
                <slot name="footer"></slot>
            </footer>
        </div>
        
    </div>

</template>

<style scoped>
.overlay {
    position: fixed;/*中央に出すため */
    inset: 0;/*画面全体を覆う*/
    background: rgba(0,0,0,0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999 !important;
}

.model {
    position: relative;
    background-color: #fff;
    padding: 32px 20px;
    border-radius: 12px;
    width: 380px;
    max-width: 90%;
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    border: 3px solid var(--theme-accent);
    width: min(500px, 90vw);/* PCでは最大600px、スマホでは画面幅に合わせる */
    max-height: 90vh;/* 画面の90%まで */
    overflow-y: auto;/* はみ出した分は中でスクロール */
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 12px;
    background: none;
    border: none;
    font-size: 22px;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}
</style>