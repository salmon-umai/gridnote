<script setup lang="js">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

import AuthLayout from '../components/AuthLayout.vue';
import CenterModal from '@/components/common/CenterModal.vue';

const username = ref("");
const password = ref("");
const password2 = ref("");

const errorMessage = ref("");
const passwordRegex = /^[a-zA-Z0-9]+$/;

//モーダル制御
const showModal = ref(false);
const registerUser = ref("");//表示のために保管
const registerPass = ref("");

const register = async () => {
    errorMessage.value = "";

    //バリデーションチェック
    if(!username.value || !password.value) {
        errorMessage.value = "ユーザー名とパスワードを入力してください。"
        return;
    }
    if(password.value !== password2.value) {
        errorMessage.value = "パスワードが一致していません。";
        return;
    }
    if(password.value.length < 8) {
        errorMessage.value = "パスワードは8文字以上を入力してください。"
        return;
    }
    if(!passwordRegex.test(password.value)) {
        errorMessage.value = "パスワードは半角英数字のみを使用してください。"
        return;
    }

    //サーバーに送信
    const res = await fetch("http://localhost:3000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
            username: username.value,
            password: password.value
        })
    });

    const data = await res.json();

    if(!res.ok) {
        errorMessage.value = data.error || "登録に失敗しました。"
        return;
    }

    //登録成功⇒モーダルに表示
    registerUser.value = username.value;
    registerPass.value = password.value;

    showModal.value = true;

    username.value = "";
    password.value = "";
    password2.value = "";
};

//モーダル閉じる
const closeModal = () => {
    showModal.value = false;
};
</script>

<template>
    <AuthLayout title="アカウント登録">
        <form class="form" @submit.prevent="register">
            <label>ユーザー名<br>
                <input type="text"
                v-model="username"></input>
            </label><br>
            <label>パスワード<br><span>※半角英数字8文字以上を設定してください。</span><br>
                <input type="text"
                v-model="password"></input>
            </label><br>
            <label>パスワード再入力<br>
                <input type="text" id="last"
                v-model="password2"></input>
            </label>
            <div class="error-area">
                <span v-show="errorMessage" id="error-message">
                    {{ errorMessage }}</span>
            </div>
            <button type="submit">登録</button>



        </form>
        <CenterModal :show="showModal" @close="closeModal">
            <template #header><h2>登録が完了しました</h2></template>
            <p>ユーザー名：{{ registerUser }}</p>
            <p>パスワード：{{ registerPass }}</p>

            <template #footer>
                <button @click="closeModal">OK</button>
            </template>

        </CenterModal>
        <div class="line-box">
            <div class="line"></div>
            </div>
            <RouterLink to="/login">
                <p class="to-login">ログインはこちら</p>
            </RouterLink>
    </AuthLayout>
</template>

<style scoped>
 .form {
    padding: 40px 80px;
    text-align: left;
    color: var(--theme-hover);
    font-size: 14px;
 }
 span {
    font-size: 12px;
 }

 input[type=text] {
    font-size: 14px;
    width: 350px;
    margin-bottom: 10px;
    border-radius: 4px;
    height: 30px;
    border: 1px solid var(--theme-main);
 }

 #last {
    margin-bottom: 30px;
 }

 button {
    width: 350px;
    margin: 0 auto;
    background-color: var(--theme-main);
    color: var(--theme-font);
    height: 35px;
    border-radius: 8px;
    font-size: 16px;
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

 .to-login {
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