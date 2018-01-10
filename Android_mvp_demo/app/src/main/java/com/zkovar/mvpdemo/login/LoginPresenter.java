package com.zkovar.mvpdemo.login;

import android.support.annotation.NonNull;

public class LoginPresenter implements LoginContract.Presenter {

    private static final String SUCCESS_USER = "user";
    private static final String SUCCESS_PASS = "pass";

    private LoginContract.View view;

    public LoginPresenter(@NonNull LoginContract.View view) {
        this.view = view;
    }

    @Override
    public void authenticate(String user, String pass) {
        if (SUCCESS_USER.equals(user) && SUCCESS_PASS.equals(pass)) {
            view.showLoginSuccess();
        } else {
            view.showLoginFailure();
        }
    }
}
