package com.zkovar.mvpdemo.login;

public interface LoginContract {

    interface Presenter {
        void authenticate(String user, String pass);
    }

    interface View {
        void showLoginSuccess();
        void showLoginFailure();
    }
}
