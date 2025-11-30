# 华容道小游戏

移动端优先的滑块华容道，界面全中文，支持撤销与复位。默认布局采用经典曹操出逃阵型。

## 操作说明
- 拖动或轻滑棋子即可沿方向平移，多格空位会连滑。
- 点击“撤销”回到上一步，次数不限。
- 点击“复位”重新开始，步数会清零。
- 让曹操移动到底部出口位置即可胜利。

## 本地体验
1. 进入目录：`cd hua-rong-dao`
2. 启动一个静态服务器（任意方式均可，例如）：`python3 -m http.server 4000`
3. 浏览器访问对应端口即可。

## 部署到 GitHub Pages
- 已添加工作流 `.github/workflows/deploy.yml`，push 到 `main` 分支后会自动把 `hua-rong-dao` 目录发布到 `gh-pages` 分支。
- 在仓库 Settings → Pages 选择 `gh-pages` 分支作为来源即可上线。
- GitHub 默认项目地址形如 `https://4ier.github.io/toys-for-fun/`。若需使用 `https://4ier.github.io/hua-rong-dao`，可以在用户页仓库或自定义域名中创建同名子目录，并将工作流的目标分支/仓库调整为该站点仓库。
