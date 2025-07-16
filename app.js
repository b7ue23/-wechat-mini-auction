App({
    onLaunch() {
      this.login(); // 启动时自动登录
    },
    globalData: {
      userId: null // 全局存储userId
    },
    login() {
      // 1. 获取微信临时code
      wx.login({
        success: (res) => {
          const code = res.code;
          // 2. 传给后端接口换取userId
          wx.request({
            url: 'http://localhost:8080/user/login',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded' // 关键修改：指定表单格式
            },
            data: {
              code: code // 必须传code
            },
            success: (res) => {
              // 3. 存储userId（全局+本地缓存）
              if (res.statusCode === 200 && typeof res.data === 'number') { // 后端返回的是userId数字
                this.globalData.userId = res.data;
                wx.setStorageSync('userId', res.data);
                console.log('登录成功，userId:', res.data);
              } else {
                console.error('登录失败，错误码:', res.statusCode, '错误信息:', res.data);
                wx.showToast({ title: '登录失败，请重试', icon: 'none' });
              }
            },
            fail: (err) => {
              console.error('登录请求失败:', err);
              wx.showToast({ title: '网络请求失败', icon: 'none' });
            }
          });
        },
        fail: (err) => {
          console.error('wx.login失败:', err);
          wx.showToast({ title: '微信登录失败', icon: 'none' });
        }
      });
    }
  });