#!/usr/bin/env python3
from urllib.parse import quote, unquote
import sys

if len(sys.argv) < 3:
    print("用法: urlcode.py <encode|decode> <字符串>")
    sys.exit(1)

action, text = sys.argv[1], sys.argv[2]

if action == "encode":
    print(quote(text, safe=''))  # safe='' 编码所有特殊字符
elif action == "decode":
    print(unquote(text))
else:
    print("未知操作，使用 encode 或 decode")
