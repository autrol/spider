/*
 * @Author: zhinian.yang 
 * @Date: 2018-02-13 11:09:38 
 * @Desc: 页面爬虫
 * @Last Modified by:   zhinian.yang 
 * @Last Modified time: 2018-02-13 11:09:38 
 */
require('chromedriver'); // 导入chrome浏览器 driver
const fs         = require('fs');
const { URL }    = require('url');
const webdriver  = require('selenium-webdriver'); //导入selenium 库
const driver     = new webdriver.Builder().forBrowser('chrome').build(); // 创建一个chrome 浏览器实例

var detailUrls = [];

driver.get("https://m.huiguo.net/") // 打开https://m.huiguo.net/

// 开始爬数据
driver.sleep(3000).then(function () {
    driver.executeScript(`
        var tabIds = [],
            tabs = document.querySelectorAll('.timeTab_wrap [data-id]');
        
        tabs.forEach(function(elem) {
            tabIds.push(elem.attributes['data-id'].value);
        });
        return tabIds;
    `).then(function (result) {
        console.log(result);
        getDetailUrls(result, 0);
    });
});

function getDetailUrls(cids, index) {
    if (index === 1) {
        // 存入文件
        saveResult(detailUrls);
        return '';
    }
    console.log(cids[index]);
    driver.executeScript(`
        var tab${index} = document.querySelector('[data-id="${cids[index]}"]');
        
        window.scrollTo(0, 0);
        tab${index}.click();
    `);
    renderList(function() {
        getDetailUrls(cids, ++index);
    });
}

function renderList(cb) {
    driver.sleep(3500).then(function() {
        driver.executeScript(`
            var detailUrls = [],
                goodItems = document.querySelectorAll('.good-item a');

            goodItems.forEach(function (elem) {
                var href = '',
                    hrefElem = elem.attributes['href'];

                if (hrefElem) {
                    href = hrefElem.value;
                }
                if (href) {
                    detailUrls.push(href);
                    elem.removeAttribute('href');
                }
            });
            window.scrollTo(0, window.scrollY - 20);
            window.scrollTo(0, 2000000);
            if (document.querySelector('.flow > p').innerHTML === '努力加载中...') {
                return detailUrls;
            } else {
                return false;
            }
        `).then(function (result) {
            console.log(result);
            if (!result) {
                typeof cb === 'function' && cb();
                return;
            }
            detailUrls = detailUrls.concat(result);
            renderList(cb);
        });
    });
}

function saveResult (data) {
    var origin = 'http://m.huiguo.com',
        formatData = [];

    data.forEach(function (value) {
        console.log(value);
        var queryObj = new URL(`${origin}${value}`);
        formatData.push({
            goods_id:  queryObj.searchParams.get('goods_id'),
            activity_id:  queryObj.searchParams.get('activity_id'),
        });
    });
    // 写入JSON文件
    fs.writeFile('./data/products..json', JSON.stringify(formatData, false, 4), 'utf8', (err) => {
        if (err) throw err;
        console.log('文件保存成功！');
    });
}