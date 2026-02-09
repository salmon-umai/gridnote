<script setup lang="js">
import { APP_NAME } from "../config/appConfig.js";

defineProps({
    //このコンポーネントが何を外から受け取れるか宣言
    title: String
})
</script>

<template>
    <div class="auth-layout">
        <div class="auth-wrapper">
            <div class="auth-box">
                <div class="app-title">{{ APP_NAME }}</div>
                <h2>{{ title }}</h2>
                <slot></slot>
                <!--slot:枠だけ用意して、入れる中身は後で差し替える箱-->
                <div class="link-area">
                    <slot name="link"></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.app-title {
    position: relative;
    top: -40px;   /* 枠の外に少し出したい場合はマイナス */
    left: 16px;
    font-size: 30px;
}
h2 {
    text-align: center;
    color: var(--theme-hover);
}

.auth-layout {
  min-height: 100vh;
  background-image:
    linear-gradient(to right, #cccccc8b 1px, transparent 1px),
    linear-gradient(to bottom, #cccccc8b 1px, transparent 1px);
  background-size: 30px 30px;
}

.auth-wrapper {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.auth-box {
    width: 500px;
    border-radius: 16px;
    background: #fff;
    border: 2px solid var(--theme-accent);
    position: relative;
}
</style>