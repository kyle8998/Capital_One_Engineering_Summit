package com.zkovar.mvpdemo;

import com.zkovar.mvpdemo.login.LoginContract;
import com.zkovar.mvpdemo.login.LoginPresenter;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;

/**
 * Created by zkovar on 1/9/18.
 */

@RunWith(MockitoJUnitRunner.class)
public class LoginPresenterTest {

    @Mock
    private LoginContract.View view;

    private LoginPresenter presenter;

    @Before
    public void setup() {
        presenter = new LoginPresenter(view);
    }

    @Test
    public void testBadAuthentication() {
        presenter.authenticate("wrong", "creds");
        InOrder inOrder = Mockito.inOrder(view);
        inOrder.verify(view).showLoginFailure();
        inOrder.verifyNoMoreInteractions();
    }

    @Test
    public void testSuccessfulAuthentication() {
        presenter.authenticate("user", "pass");
        InOrder inOrder = Mockito.inOrder(view);
        inOrder.verify(view).showLoginSuccess();
        inOrder.verifyNoMoreInteractions();
    }

}
