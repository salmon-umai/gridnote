<script setup lang="js">
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import { applyTheme, themes } from "../utils/theme.js";

import AuthLayout from '../components/AuthLayout.vue';

import api from "@/api/axios.js";

const router = useRouter();

const username = ref("");
const password = ref("");
const errorMessage = ref("");

//ログイン処理
const login = async () => {
   errorMessage.value = ""//エラー消す

   try{
      const res = await api.post("/api/auth/login", {
         username: username.value,
         password: password.value
   });
   //成功→トークンを保存
   localStorage.setItem("token", res.data.token);

   //ユーザー情報の取得
   const me = await api.get("/api/users/me");

   if(me.data.theme_id && themes[me.data.theme_id]) {
      applyTheme(themes[me.data.theme_id]);
   }

   router.push("/home");

   } catch(err) {
   console.error("ログイン失敗", err);
   errorMessage.value = "ログインに失敗しました";
}

      //Vue(fetch) → server/index.js → /auth が一致 
      // → auth.js の router.post("/login") 実行
};

</script>

<template>
    <AuthLayout title="ログイン" class="title">
     
        <form class="form" @submit.prevent = "login">
            <label>ユーザー名<br>
                <input type="text"
                v-model="username"></input>
            </label><br>
            <label>パスワード<br>
                <input type="password" id="last"
                v-model="password"
                autocomplete="current-password">
               </input>
            </label>
            <span id="error-message" v-show="errorMessage">
               {{ errorMessage }}
            </span>

               <button type="submit">ログイン</button>
        </form>
            <div class="line-box">
            <div class="line"></div>または<div class="line"></div>
            </div>
            <RouterLink to="/register">
                <p class="to-account">アカウント登録する</p>
            </RouterLink>
    </AuthLayout>
</template>

<style scoped>
 .form {
    padding: 40px 90px 10px 90px;
    text-align: left;
    color: var(--theme-hover);
 }

 input[type=text],
 input[type=password] {
    font-size: 14px;
    width: 320px;
    margin-bottom: 10px;
    border-radius: 4px;
    height: 20px;
    border: 1px solid var(--theme-main);
    height: 30px;
 }

 #last {
    margin-bottom: 50px;
 }
 button {
    width: 320px;
    margin: 0 auto;
    background-color: var(--theme-main);
    color: var(--theme-font);
    height: 35px;
    border-radius: 8px;
    font-size: 15px;
    cursor: pointer;
 }

 button:hover {
    background-color: var(--theme-hover);
 }

 .line-box {
    display: flex;
    flex-direction: row; /*横並び*/
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 30px 30px 0 30px;
 }
 .line {
    flex: 1;/*横方向に余っているスペースを、指定したflexの値に応じて分ける*/
    height: 0;
    border: 2px solid var(--theme-main);
 }

 .to-account {
    color: var(--theme-hover);
    font-weight: 600;
    font-size: 20px;
    text-align: center;
    margin-bottom: 30px;
 }

 #error-message {
   color: red;
   height: 20px;
   line-height: 20px;
   display: block;
   font-size: 14px;
   margin-bottom: 15px;
 }

</style>