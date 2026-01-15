#!/usr/bin/env node

/**
 * Gitee AI 接口测试脚本
 * 用于诊断 zimage/Gitee AI 接口问题
 */

const http = require('http');

const PORT = 3000;
const HOST = 'localhost';

console.log('🧪 测试 Gitee AI 接口...\n');

// 测试 1: 检查配额
console.log('📊 测试 1: 查询配额状态');
const quotaOptions = {
  hostname: HOST,
  port: PORT,
  path: '/api/gitee-ai',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const quotaReq = http.request(quotaOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`状态码: ${res.statusCode}`);
    try {
      const json = JSON.parse(data);
      console.log('配额信息:', JSON.stringify(json, null, 2));
      
      if (json.quota) {
        console.log(`✅ 剩余配额: ${json.quota.remaining}/${json.quota.limit}`);
      }
    } catch (e) {
      console.log('响应:', data);
    }
    console.log('\n---\n');
    
    // 测试 2: 生成图片
    testGeneration();
  });
});

quotaReq.on('error', (e) => {
  console.error(`❌ 配额查询失败: ${e.message}`);
  console.log('请确保开发服务器正在运行: npm run dev\n');
  process.exit(1);
});

quotaReq.end();

// 测试生成图片
function testGeneration() {
  console.log('🎨 测试 2: 生成图片');
  
  const postData = JSON.stringify({
    prompt: '一只可爱的小猫',
    model: 'z-image-turbo',
    num_inference_steps: 9,
    guidance_scale: 1
  });
  
  const genOptions = {
    hostname: HOST,
    port: PORT,
    path: '/api/gitee-ai',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const genReq = http.request(genOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`状态码: ${res.statusCode}`);
      
      try {
        const json = JSON.parse(data);
        
        if (res.statusCode === 200) {
          console.log('✅ 生成成功!');
          if (json.imageData) {
            console.log(`图片数据长度: ${json.imageData.length} 字符`);
          }
          if (json.imageUrl) {
            console.log(`图片 URL: ${json.imageUrl}`);
          }
          if (json.quota) {
            console.log(`剩余配额: ${json.quota.remaining}/${json.quota.limit}`);
          }
        } else if (res.statusCode === 429) {
          console.log('⚠️  配额已用完');
          console.log(json.message);
        } else if (res.statusCode === 503) {
          console.log('❌ 服务不可用');
          console.log(json.message);
        } else {
          console.log('❌ 生成失败');
          console.log('错误:', json.error || json.message);
        }
        
        console.log('\n完整响应:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('响应:', data);
      }
    });
  });
  
  genReq.on('error', (e) => {
    console.error(`❌ 生成请求失败: ${e.message}`);
  });
  
  genReq.write(postData);
  genReq.end();
}
