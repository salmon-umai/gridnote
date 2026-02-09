<script setup lang="js">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import api from "../../../api/axios.js";
import CenterModal from "@/components/common/CenterModal.vue";

const user = ref({
    user_name: ""
});
const isEditOpen = ref(false);
const newUserName = ref("");

const isPasswordEditOpen = ref(false);
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const passwordMessage = ref("");
const isPasswordSuccess = ref(false);


//ユーザー名表示
onMounted(async () => {
    const res = await api.get("/api/users/me");
    user.value = res.data;
});

//ユーザー名変更
const openEditUserName = () => {
    isEditOpen.value = true;
};
const updateUserName = async () => {
    try {
        await api.put("/api/users/username", {
            user_name: newUserName.value
        });
        //画面にすぐ反映
        user.value.user_name = newUserName.value;
        newUserName.value = "";

        isEditOpen.value = false;
    } catch (err) {
        console.error("ユーザー名更新失敗", err);
    }
};

//パスワード変更
const openEditPassword = () => {
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
    passwordMessage.value = "";
    isPasswordEditOpen.value = true;
};

const updatePassword = async () => {
    passwordMessage.value = "";

    if(newPassword.value !== confirmPassword.value) {
    passwordMessage.value = "新しいパスワードが一致しません";
    isPasswordSuccess.value = false;
    return;
    }  
    try {
        await api.put("/api/users/password", {
            current_password: currentPassword.value,
            new_password: newPassword.value
        });
        //成功したらリセット
        passwordMessage.value = "パスワードを変更しました"
        isPasswordSuccess.value = true;
        confirmPassword.value = "";
        currentPassword.value = "";
        newPassword.value = "";

    } catch (err) {
        if (err.response) {
            passwordMessage.value = err.response.data.error ?? "通信エラーが発生しました";
            isPasswordSuccess.value = false;
        }
    }
};

//ログアウト
const router = useRouter();
const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
}
</script>

<template>
    <div class="account">
        <div class="user-setting">
            <h2>アカウント設定</h2>
            <div class="user-box">
                <p class="user-name" v-if="user">
                    ユーザー名： {{ user.user_name }}
                </p>
            </div>
            <div class="setting-btn">
                <button id="username" class="btn" @click="openEditUserName">
                    ユーザー名変更
                </button>
                <button id="password" class="btn" @click="openEditPassword">
                    パスワード変更</button>
                <RouterLink to="/home" class="btn">
                    メイン画面に戻る
                </RouterLink>

                <button id="logout" class="btn" @click="logout">
                    ログアウト</button>
            </div>
        </div>
        <!--ユーザー変更モーダル-->
        <CenterModal :show="isEditOpen" @close="isEditOpen = false" 
        contentClass="account-modal">
            <h2>ユーザー名変更</h2>
            <p class="modal-title">現在のユーザー名： {{ user.user_name }}</p>
            <label class="modal-title">新しいユーザー名：</label>
                <input type="text" v-model="newUserName" class="new-name">
            <div class="modal-btn">
                <button class="btn" @click="updateUserName">
                    変更
                </button>
                <button class="btn" @click="isEditOpen = false">
                    キャンセル
                </button>
            </div>
        </CenterModal>

        <!--パスワード変更モーダル-->
        <CenterModal :show="isPasswordEditOpen" 
        @close="isPasswordEditOpen = false" contentClass="account-modal">
            <h2>パスワード変更</h2>
            <div class="form-group">
                <label class="modal-title">現在のパスワード：</label><br>
                <input type="password" v-model="currentPassword">
            </div>
            <div class="form-group">
                <label class="modal-title">新しいパスワード：</label><br>
                <input type="password" v-model="newPassword">
            </div>
            <div class="form-group">
                <label class="modal-title">新しいパスワード（再確認）：</label><br>
                <input type="password" v-model="confirmPassword">
            </div>
            <p v-if="passwordMessage" :class="isPasswordSuccess ? 'success' : 'error'">
                {{ passwordMessage }}
            </p>
            <div class="modal-btn">
                <button class="btn" @click="updatePassword">
                    変更
                </button>
                <button class="btn sub" @click="isPasswordEditOpen = false">
                    閉じる
                </button>
            </div>
        </CenterModal>
    </div>

</template>

<style scoped>
.account {
    min-height: 100vh;
    background-color: #e0e0e0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.user-name {
    font-size: 15px;
}

.user-box {
    padding: 40px;
    margin-top: 0;
    border: 1px solid #585858;
    background-color: #fff;
    border-radius: 20px;
}

.setting-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
    text-decoration: none;
}

.btn {
    margin-top: 10px;
    font-size: 16px;
    padding-top: 10px;
    padding-bottom: 10px;
    width: 300px;
    cursor: pointer;
    background-color: #fff;
    border: 1px solid #585858;
    border-radius: 10px;
    color: inherit;
    text-decoration: none;
}

.btn:visited {
    color: inherit;
}

#logout {
    margin-top: 40px;
    color: #ff1616;
    font-weight: 700;
}

.modal-title {
    font-size: 16px;
}

input[type=text],
input[type=password] {
    width: 300px;
    height: 20px;
    font-size: 14px;
    margin-bottom: 10px;
}
input[type=password] {
    width: 400px;
}

.modal-btn {
    margin-top: 20px;
    display: flex;
    gap: 20px;
}

.btn:hover {
    background-color: var(--theme-accent);
}
.error {
  color: #e60000;
  font-size: 14px;
  margin-top: 8px;
  font-weight: 600;
}
.success {
    color: #2e7d32;
    font-size: 14px;
    font-weight: 700;
}

</style>