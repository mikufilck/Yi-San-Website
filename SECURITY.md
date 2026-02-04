# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

请不要通过公开的 GitHub Issue 报告安全漏洞。
如果你发现了安全隐患（如越权访问、SQL 注入风险或频率限制失效），请通过以下方式联系我们：
1. 首选方式：发送邮件至xuw05302@gmail.com。
2. 邮件主题：请使用 [Security-Report] 项目名称 - 漏洞简述。

我们在收到邮件后，通常会在 48 小时 内回复并确认影响范围。

## Our Security Commitments

本项目在设计上已经包含以下安全防护，若你发现这些机制可被绕过，请务必告知：
* IP-Based Rate Limiting: 针对敏感接口（登录等）的暴力破解防护。
* Role-Based Access Control (RBAC)：管理端与业主端的严格权限隔离。
* Environment Isolation: 所有的敏感凭证（数据库密码、密钥）均通过环境变量管理。

## Disclosure Policy

在修复程序发布之前，我们请求报告者对漏洞细节保持保密。修复完成后，我们会在 Release Notes 中公开致谢报告者。
