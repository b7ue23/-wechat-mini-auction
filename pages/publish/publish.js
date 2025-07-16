Page({
    data: {
      title: "",
      desc: "",
      price: 0,
      imageUrl: "",
      tempImagePath: "",
      date: "",
      time: "",
      endTime: "", // YYYY-MM-DD HH:mm:ss
      isLoading: false
    },
  
    onTitleInput(e) {
      this.setData({ title: e.detail.value });
    },
  
    onDescInput(e) {
      this.setData({ desc: e.detail.value });
    },
  
    onPriceInput(e) {
      this.setData({ price: Number(e.detail.value) });
    },
  
    onDateChange(e) {
      this.setData({ date: e.detail.value }, this.updateEndTime);
    },
  
    onTimeChange(e) {
      this.setData({ time: e.detail.value }, this.updateEndTime);
    },
  
    updateEndTime() {
      const { date, time } = this.data;
      if (date && time) {
        const endTime = `${date} ${time}:00`;
        this.setData({ endTime });
      }
    },
  
    chooseAndUploadImage() {
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempImagePath = res.tempFilePaths[0];
          this.setData({ tempImagePath });
          this.uploadImage(tempImagePath);
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
          wx.showToast({ title: '选择图片失败', icon: 'none' });
        }
      });
    },
  
    uploadImage(tempFilePath) {
      const userId = wx.getStorageSync('userId');
      if (!userId) {
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
  
      wx.showLoading({ title: '上传中...' });
      wx.uploadFile({
        url: 'http://localhost:8080/upload',
        filePath: tempFilePath,
        name: 'file',
        formData: { userId },
        success: (res) => {
          wx.hideLoading();
          if (res.statusCode === 200) {
            try {
              const result = JSON.parse(res.data);
              if (result.code === 0 && result.data) {
                this.setData({ imageUrl: result.data });
                wx.showToast({ title: '上传成功' });
              } else {
                wx.showToast({ title: '上传失败', icon: 'none' });
                console.error('上传失败:', result.msg || res.data);
              }
            } catch (err) {
              wx.showToast({ title: '解析响应失败', icon: 'none' });
              console.error('解析响应失败:', err);
            }
          } else {
            wx.showToast({ title: '上传失败', icon: 'none' });
            console.error('上传失败，状态码:', res.statusCode);
          }
        },
        fail: (err) => {
          wx.hideLoading();
          wx.showToast({ title: '网络错误', icon: 'none' });
          console.error('上传请求失败:', err);
        }
      });
    },
  
    handlePublish() {
      const { title, desc, price, imageUrl, endTime } = this.data;
      const userId = wx.getStorageSync("userId");
  
      if (!title.trim()) return wx.showToast({ title: '请输入标题', icon: 'none' });
      if (!desc.trim()) return wx.showToast({ title: '请输入描述', icon: 'none' });
      if (price <= 0) return wx.showToast({ title: '请输入有效价格', icon: 'none' });
      if (!endTime) return wx.showToast({ title: '请选择结束时间', icon: 'none' });
      if (!imageUrl) return wx.showToast({ title: '请上传图片', icon: 'none' });
      if (!userId) return wx.showToast({ title: '请先登录', icon: 'none' });
  
      const endDate = new Date(endTime);
      const now = new Date();
      if (endDate <= now) {
        return wx.showToast({ title: '结束时间必须晚于当前时间', icon: 'none' });
      }
  
      const requestData = {
        title,
        desc,
        startPrice: price,
        currentPrice: price,
        imageUrl,
        endTime,
        userId: Number(userId)
      };
  
      this.setData({ isLoading: true });
      wx.request({
        url: "http://localhost:8080/item",
        method: "POST",
        header: { "Content-Type": "application/json" },
        data: JSON.stringify(requestData),
        success: (res) => {
          if (res.statusCode === 200) {
            wx.showToast({ title: '发布成功' });
            setTimeout(() => wx.navigateBack(), 1500);
          } else {
            wx.showToast({ title: '发布失败', icon: 'none' });
            console.error('发布失败:', res.data || res.errMsg);
          }
        },
        fail: (err) => {
          wx.showToast({ title: '网络错误', icon: 'none' });
          console.error('请求失败:', err);
        },
        complete: () => {
          this.setData({ isLoading: false });
        }
      });
    }
  });
  