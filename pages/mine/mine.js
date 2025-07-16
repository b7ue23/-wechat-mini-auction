Page({
    data: {
        userId: '',
        myItems: [], // 我的发布
        myBids: [], // 我的出价
        loadingItems: true,
        loadingBids: true,
        errorItems: false,
        errorBids: false
    },

    onLoad() {
        const userId = wx.getStorageSync('userId');
        if (!userId) {
            wx.showToast({
                title: '请先登录',
                icon: 'none',
                duration: 2000,
                success: () => {
                    setTimeout(() => {
                        wx.navigateBack();
                    }, 2000);
                }
            });
            return;
        }
        this.setData({ userId: userId });
        wx.setNavigationBarTitle({
            title: '个人中心'
        });
        // 加载我的发布和我的出价
        this.loadMyItems(userId);
        this.loadMyBids(userId);
    },

    // 调用后端接口：我的发布（GET /user/{id}/items）
    loadMyItems(userId) {
        wx.request({
            url: `http://localhost:8080/user/${userId}/items`,
            method: 'GET',
            success: (res) => {
                if (res.statusCode === 200) {
                    this.setData({ myItems: res.data });
                } else {
                    this.setData({ errorItems: true });
                    wx.showToast({
                        title: '获取我的发布失败',
                        icon: 'none'
                    });
                }
            },
            fail: () => {
                this.setData({ errorItems: true });
                wx.showToast({
                    title: '网络请求失败',
                    icon: 'none'
                });
            },
            complete: () => {
                this.setData({ loadingItems: false });
            }
        });
    },

    // 调用后端接口：我的出价（GET /user/{id}/bids）
    loadMyBids(userId) {
        wx.request({
            url: `http://localhost:8080/user/${userId}/bids`,
            method: 'GET',
            success: (res) => {
                if (res.statusCode === 200) {
                    // 格式化出价时间
                    const formattedBids = res.data.map(bid => {
                        return {
                            ...bid,
                            createTime: this.formatTime(bid.createTime)
                        };
                    });
                    this.setData({ myBids: formattedBids });
                } else {
                    this.setData({ errorBids: true });
                    wx.showToast({
                        title: '获取我的出价失败',
                        icon: 'none'
                    });
                }
            },
            fail: () => {
                this.setData({ errorBids: true });
                wx.showToast({
                    title: '网络请求失败',
                    icon: 'none'
                });
            },
            complete: () => {
                this.setData({ loadingBids: false });
            }
        });
    },

    // 跳转到商品详情页
    goDetail(e) {
        const itemId = e.currentTarget.dataset.id;
        wx.navigateTo({ url: `/pages/detail/detail?id=${itemId}` });
    },

    // 格式化时间
    formatTime(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}`;
    },

    // 重新加载数据
    reloadData() {
        const userId = this.data.userId;
        if (this.data.errorItems || this.data.myItems.length === 0) {
            this.setData({ loadingItems: true, errorItems: false });
            this.loadMyItems(userId);
        }
        if (this.data.errorBids || this.data.myBids.length === 0) {
            this.setData({ loadingBids: true, errorBids: false });
            this.loadMyBids(userId);
        }
    }
});    