package com.zkovar.mvpdemo.login;

import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.Toast;

import com.zkovar.mvpdemo.R;
import com.zkovar.mvpdemo.home.HomeActivity;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class LoginFragment extends Fragment implements LoginContract.View {

    public static final String TAG = LoginFragment.class.getSimpleName();

    private LoginPresenter presenter;

    @BindView(R.id.username)
    EditText username;

    @BindView(R.id.password)
    EditText password;

    public static Fragment newInstance() {
        return new LoginFragment();
    }

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_login, container, false);
        ButterKnife.bind(this, view);
        presenter = new LoginPresenter(this);
        return view;
    }

    @OnClick(R.id.signin)
    public void signin() {
        presenter.authenticate(username.getText().toString(), password.getText().toString());
    }

    @Override
    public void showLoginSuccess() {
        Intent intent = new Intent(getActivity(), HomeActivity.class);
        startActivity(intent);
    }

    @Override
    public void showLoginFailure() {
        Toast.makeText(getActivity(), "Invalid credentials", Toast.LENGTH_SHORT).show();
    }
}
