package com.zkovar.mvpdemo.login;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

import com.zkovar.mvpdemo.R;

/**
 * A login screen that offers login via email/password.
 */
public class LoginActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        getSupportFragmentManager().beginTransaction().add(R.id.fragment_container, LoginFragment.newInstance(), LoginFragment.TAG).commit();

    }
}

