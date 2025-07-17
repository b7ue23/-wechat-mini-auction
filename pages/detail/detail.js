Page({  
    data: {  

      item: {}, // 商品详情数据
      bidPrice: 0, // 用户输入的出价金额  
      bidList: [] // 历史出价记录  
    },  
  
    onLoad(options) {  
      // 从首页跳转时携带的商品id（options.id）  
      const itemId = options.id;  
      // 校验 itemId 是否存在（防止 undefined 导致后端报错）
      if (!itemId) {
        wx.showToast({ title: '商品ID缺失，请返回重试', icon: 'none' });
        return;
      }
      // 加载商品详情和历史出价记录  
      this.loadItemDetail(itemId);  
      this.loadBidHistory(itemId);  
    },  
  
    // 调用后端接口：获取商品详情（GET /item/{id}）  
    loadItemDetail(itemId) {  
      wx.request({  
        url: `http://localhost:8080/item/${itemId}`, // 后端商品详情接口  
        method: 'GET',  
        success: (res) => {  
          if (res.statusCode !== 200) {
            wx.showToast({ title: '商品详情加载失败', icon: 'none' });
            return;
          }
          const item = res.data;  
          // 计算剩余时间（补全方法）
          item.remainTime = this.calculateRemainTime(item.endTime);  
          this.setData({ item: item });  
        },
        fail: (err) => {
          wx.showToast({ title: '网络错误，请重试', icon: 'none' });
          console.error('商品详情加载失败：', err);
        }
      });  
    },  
  
    // 调用后端接口：获取历史出价记录（GET /item/{id}/bids）  
    loadBidHistory(itemId) {  
      wx.request({  
        url: `http://localhost:8080/item/${itemId}/bids`, // 后端出价记录接口  
        method: 'GET',  
        success: (res) => {  
          if (res.statusCode !== 200) {
            wx.showToast({ title: '出价记录加载失败', icon: 'none' });
            return;
          }
          this.setData({ bidList: res.data });  
        },
        fail: (err) => {
          wx.showToast({ title: '网络错误，请重试', icon: 'none' });
          console.error('出价记录加载失败：', err);
        }
      });  
    },  
  
    // 监听出价金额输入  
    onPriceInput(e) {  
      // 过滤非数字输入（可选，防止用户输入字母）
      const value = e.detail.value.replace(/[^0-9.]/g, '');
      this.setData({ bidPrice: value });  
    },  
  
    // 点击出价按钮：调用后端接口（POST /bid）  
    handleBid() {  
      const { item, bidPrice } = this.data;  
      const userId = wx.getStorageSync('userId'); // 从本地缓存取userId  
  
      // 1. 校验基础数据  
      if (!item.id) {
        wx.showToast({ title: '商品信息异常，请刷新', icon: 'none' });
        return;
      }
      if (!userId) {
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
      const price = Number(bidPrice);
      if (isNaN(price) || price <= item.currentPrice) {  
        wx.showToast({ title: '出价必须高于当前价', icon: 'none' });  
        return;  
      }  
  
      // 2. 调用后端出价接口  
      wx.request({  
        url: 'http://localhost:8080/bid', // 后端出价接口  
        method: 'POST',  
        data: {  
          itemId: item.id,  
          userId: userId,  
          price: price // 已转数字，直接传  
        },  
        success: (res) => {  
          if (res.statusCode !== 200) {
            wx.showToast({ title: '出价失败，请重试', icon: 'none' });
            return;
          }
          const result = res.data;  
          wx.showToast({ title: result.message || '出价成功' }); // 兼容后端返回格式  
          // 出价后刷新商品详情和出价记录  
          this.loadItemDetail(item.id);  
          this.loadBidHistory(item.id);  
        },
        fail: (err) => {
          wx.showToast({ title: '网络错误，请重试', icon: 'none' });
          console.error('出价失败：', err);
        }
      });  
    },  
  
    // 计算剩余时间（补全实现，假设 endTime 是 yyyy-MM-dd HH:mm:ss 格式）  
    calculateRemainTime(endTime) {  
      if (!endTime) return '已结束';  
      const end = new Date(endTime).getTime();  
      const now = new Date().getTime();  
      if (end < now) return '已结束';  
  
      const diff = end - now;  
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));  
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));  
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));  
      return `${days}天${hours}小时${minutes}分钟`;  
    }  
  });  