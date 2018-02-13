/*
 * @Author: zhinian.yang 
 * @Date: 2018-02-13 11:09:16 
 * @Desc: 接口爬虫
 * @Last Modified by:   zhinian.yang 
 * @Last Modified time: 2018-02-13 11:09:16 
 */
const fs        = require('fs');
const http      = require('http');
const cheerio   = require('cheerio');
const iconvLite = require('iconv-lite');

var startIndex = 2253;
var endIndex = 2858;
var chapters = [];


const getChapters = function (currentIndex, endIndex) {
    console.log(`爬取接口: http://www.tangsanshu.com/douluodalu/${currentIndex}.html`);
    if (currentIndex > endIndex) {
        // 生成txt文件
        fs.writeFile('./data/斗罗大陆.txt', chapters.join(''), 'utf8', (err) => {
            if (err) throw err;
            console.log('文件保存成功！');
        });
        return false;
    }

    http.get(`http://www.tangsanshu.com/douluodalu/${currentIndex}.html`, (res) => {
        let chunks = [];
        res.on('data', (chunk) => {
            chunks.push(chunk);
        });
        res.on('end', () => {
            // 解决中文乱码问题
            const html = iconvLite.decode(Buffer.concat(chunks), 'gb2312');
            chapters.push(formatHTML(currentIndex, html));
            getChapters(++currentIndex, endIndex);
        });
    }).on('error', (e) => {
        getChapters(++currentIndex, endIndex);
    }); 
}

function formatHTML(currentIndex, html) {
    const $ = cheerio.load(html, {
        decodeEntities: false
    });
    // HTML处理
    let title = $('.b_title').html();
    $('.blockcontent').prepend(title);
    $('.blockcontent .novel_bottom').remove();
    $('br').remove();
    
    return $('.blockcontent').html();
}

getChapters(startIndex, endIndex);
