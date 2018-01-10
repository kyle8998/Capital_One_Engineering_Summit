package com.zkovar.mvpdemo.home;

import android.app.Activity;
import android.os.Bundle;
import android.support.annotation.Nullable;

import com.zkovar.mvpdemo.R;

public class HomeActivity extends Activity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);
    }
}
