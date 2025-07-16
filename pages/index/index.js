// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

// 首页逻辑  
Page({  
  data: {  
    itemList: [] // 存储商品列表数据  
  },  

  onLoad() {  
    // 页面加载时，调用后端接口获取商品列表  
    this.loadItemList();
  },  

  // 调用后端接口：获取商品列表（GET /items）  
  loadItemList() {  
    wx.request({  
      url: 'http://localhost:8080/items', // 后端商品列表接口  
      method: 'GET',  
      success: (res) => {
        console.log('商品列表请求成功:', res.data); // 调试信息
        
        // 检查返回状态码和数据格式
        if (res.statusCode === 200) {
          // 后端返回的商品列表
          const itemList = res.data;
          
          // 计算每个商品的剩余时间
          const itemListWithTime = itemList.map(item => {
            item.remainTime = this.calculateRemainTime(item.endTime);
            return item;
          });
          
          // 更新页面数据
          this.setData({ itemList: itemListWithTime });
          
          // 无商品数据时的提示
          if (itemList.length === 0) {
            wx.showToast({ title: '暂无商品数据', icon: 'none' });
          }
        } else {
          console.error('请求失败，状态码：', res.statusCode);
          wx.showToast({ title: `请求失败 ${res.statusCode}`, icon: 'none' });
        }
      },  
      fail: (err) => {  
        console.error('加载商品失败：', err);  
        wx.showToast({ title: '网络请求失败', icon: 'none' });  
      }  
    });  
  },  

  // 计算剩余时间（endTime格式应为"2025-08-01 23:59:59"）  
  calculateRemainTime(endTime) {
    try {
      if (!endTime) return '时间格式错误';
      
      const end = new Date(endTime.replace(/-/g, '/')).getTime(); // 兼容iOS日期格式
      const now = new Date().getTime();
      const remainMs = end - now;
      
      if (remainMs <= 0) return '已结束';
      
      // 转换为时分秒
      const days = Math.floor(remainMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remainMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remainMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainMs % (1000 * 60)) / 1000);
      
      if (days > 0) return `${days}天${hours}时`;
      return `${hours}时${minutes}分${seconds}秒`;
    } catch (error) {
      console.error('时间计算错误:', error);
      return '时间计算错误';
    }
  },  

  // 点击商品项，跳转到详情页（传商品id）  
  goDetail(e) {  
    const itemId = e.currentTarget.dataset.id;  
    if (!itemId) return; // 防御性编程
    
    wx.navigateTo({  
      url: `/pages/detail/detail?id=${itemId}`  
    });  
  },  

  // 点击发布按钮，跳转到发布页  
  goPublish() {  
    // 检查用户是否已登录（假设登录状态保存在globalData中）
    const app = getApp();
    if (!app.globalData.userId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    
    wx.navigateTo({  
      url: '/pages/publish/publish'  
    });  
  }  
});