# -*- coding: utf-8 -*-
"""本地导入脚本，只在电脑上跑，不会上传到微信。

读笔记仓库的 Markdown，生成 miniprogram/data/*.js（微信不能 require JSON）。
小程序运行时 require 这些 JS 模块，不再访问 SRC_ROOT。
笔记有更新时再执行一次本脚本，然后重新预览/上传。
"""
import json
import os
import re
from pathlib import Path

SRC_ROOT = Path(r"d:\code\project\code-java\Java-notes\Java八股文")
DEST_DIR = Path(__file__).resolve().parent.parent / "miniprogram" / "data"

MODULES = [
    {"id": "basic", "dir": "01-基础", "title": "基础篇", "subtitle": "面向对象 · 集合 · 异常", "icon": "☕", "theme": "basic"},
    {"id": "jvm", "dir": "02-JVM", "title": "JVM 篇", "subtitle": "内存模型 · GC · 类加载", "icon": "⚙️", "theme": "jvm"},
    {"id": "thread", "dir": "03-多线程&并发", "title": "多线程", "subtitle": "锁 · 并发 · 线程池", "icon": "⚡", "theme": "thread"},
    {"id": "spring", "dir": "04-Spring/SpringFramework", "title": "Spring", "subtitle": "IOC · AOP · 事务", "icon": "🍃", "theme": "spring"},
    {"id": "springboot", "dir": "04-Spring/SpringBoot", "title": "SpringBoot", "subtitle": "自动装配 · 起步依赖", "icon": "🚀", "theme": "boot"},
    {"id": "springcloud", "dir": "04-Spring/SpringCloud", "title": "SpringCloud", "subtitle": "微服务 · 网关 · 注册中心", "icon": "☁️", "theme": "cloud"},
    {"id": "mybatis", "dir": "07-MyBatis", "title": "MyBatis", "subtitle": "映射 · 缓存 · 插件", "icon": "📒", "theme": "mybatis"},
    {"id": "mysql", "dir": "05-MySQL", "title": "MySQL", "subtitle": "索引 · 事务 · 锁", "icon": "🐬", "theme": "mysql"},
    {"id": "redis", "dir": "09-Redis", "title": "Redis", "subtitle": "缓存 · 持久化 · 高可用", "icon": "🔴", "theme": "redis"},
    {"id": "distributed", "dir": "10-分布式", "title": "分布式", "subtitle": "锁 · 一致性 · 限流", "icon": "🔗", "theme": "distributed"},
    {"id": "nginx", "dir": "11-Nginx", "title": "Nginx", "subtitle": "反向代理 · 负载均衡", "icon": "🟩", "theme": "nginx"},
    {"id": "zk", "dir": "12-zookeeper", "title": "ZooKeeper", "subtitle": "ZAB · 选主 · 监听", "icon": "🦓", "theme": "zk"},
    {"id": "mq", "dir": "13-MQ", "title": "消息队列", "subtitle": "可靠性 · 顺序 · 积压", "icon": "📨", "theme": "mq"},
    {"id": "kafka", "dir": "13-MQ/Kafka", "title": "Kafka", "subtitle": "分区 · 副本 · 消费组", "icon": "🪵", "theme": "kafka"},
    {"id": "rabbit", "dir": "13-MQ/RabbitMQ", "title": "RabbitMQ", "subtitle": "交换机 · 队列 · 确认", "icon": "🐰", "theme": "rabbit"},
    {"id": "rocketmq", "dir": "13-MQ/RocketMQ", "title": "RocketMQ", "subtitle": "存储 · 事务消息 · 高可用", "icon": "🔥", "theme": "rocket"},
    {"id": "es", "dir": "14-Elasticsearch", "title": "Elasticsearch", "subtitle": "倒排 · 分片 · 查询", "icon": "🔎", "theme": "es"},
    {"id": "linux", "dir": "15-容器/Linux", "title": "Linux", "subtitle": "命令 · 权限 · 排障", "icon": "🐧", "theme": "linux"},
    {"id": "docker", "dir": "15-容器/Docker", "title": "Docker", "subtitle": "镜像 · 容器 · 网络", "icon": "🐳", "theme": "docker"},
    {"id": "k8s", "dir": "15-容器/K8s", "title": "K8s", "subtitle": "Pod · 调度 · 发布", "icon": "☸️", "theme": "k8s"},
    {"id": "algo", "dir": "16-数据结构与算法", "title": "算法", "subtitle": "链表 · 树 · 动态规划", "icon": "📐", "theme": "algo"},
]


def slugify(title: str) -> str:
    text = re.sub(r"\s+", "-", title.strip())
    text = re.sub(r'[\\/:*?"<>|#]+', "", text)
    return text[:48]


def clean_inline(text: str) -> str:
    text = text.replace("**", "").replace("__", "")
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    return re.sub(r"[ \t]{2,}", " ", text)


def parse_inlines(text: str):
    text = clean_inline(text)
    spans = []
    last = 0
    for match in re.finditer(r"`([^`]+)`", text):
        if match.start() > last:
            spans.append({"t": "text", "v": text[last : match.start()]})
        spans.append({"t": "code", "v": match.group(1)})
        last = match.end()
    if last < len(text):
        spans.append({"t": "text", "v": text[last:]})
    return spans or [{"t": "text", "v": text}]


def parse_blocks(markdown: str):
    blocks = []
    parts = re.split(r"```", markdown)
    for index, part in enumerate(parts):
        if index % 2 == 1:
            lines = part.replace("\r\n", "\n").split("\n")
            first = lines[0].strip() if lines else ""
            lang = bool(re.fullmatch(r"[a-zA-Z]+", first))
            code_lines = lines[1:] if lang else lines
            code = "\n".join(code_lines).strip("\n")
            if code.strip():
                blocks.append({"type": "code", "text": code.strip("\n")})
            continue

        for raw in part.replace("\r\n", "\n").split("\n"):
            line = raw.strip()
            if not line or line == "---" or re.fullmatch(r"!\[[^\]]*\]\([^)]+\)", line):
                continue
            heading = re.match(r"^#{1,6}\s+(.+)$", line)
            if heading:
                heading_text = heading.group(1).strip()
                if heading_text != "核心点":
                    blocks.append({"type": "p", "inlines": parse_inlines(heading_text)})
                continue
            if re.match(r"^([-*]|\d+[\.、])\s+", line):
                blocks.append({"type": "li", "inlines": parse_inlines(re.sub(r"^([-*]|\d+[\.、])\s+", "", line))})
                continue
            blocks.append({"type": "p", "inlines": parse_inlines(line)})
    return blocks


def make_summary(blocks) -> str:
    fallback = ""
    for block in blocks:
        if block.get("type") not in ("p", "li") or not block.get("inlines"):
            continue
        text = "".join(span["v"] for span in block["inlines"]).strip()
        if not text or text == "核心点":
            continue
        if block.get("type") == "p":
            return f"{text[:42]}…" if len(text) > 42 else text
        if not fallback:
            fallback = text
    if not fallback:
        return ""
    return f"{fallback[:42]}…" if len(fallback) > 42 else fallback


def split_core_and_extras(markdown: str):
    normalized = markdown.replace("\r\n", "\n").strip()
    pieces = re.split(r"\n#\s*(?:拓展面试题|相关面试题)\s*\n", normalized, maxsplit=1)
    core_markdown = pieces[0]
    extra_markdown = pieces[1] if len(pieces) > 1 else ""

    title_match = re.search(r"^#\s+(.+)\s*$", core_markdown, re.M)
    title = title_match.group(1).strip() if title_match else ""
    core_body = re.sub(r"^#\s+.+\s*\n", "", core_markdown, count=1)

    extras = []
    if extra_markdown.strip():
        sections = re.split(r"\n##\s+", extra_markdown)
        starts_with_h2 = extra_markdown.lstrip().startswith("##")
        for index, section in enumerate(sections):
            trimmed = section.strip()
            if not trimmed:
                continue
            if index == 0 and not starts_with_h2:
                continue
            lines = trimmed.split("\n")
            extra_title = re.sub(r"^#+\s*", "", lines[0]).strip()
            extra_body = "\n".join(lines[1:])
            if extra_title:
                extras.append({"title": extra_title, "body": extra_body})
    return title, core_body, extras


def list_markdown_files(directory: Path):
    if not directory.exists():
        return []
    files = {
        path.name: path
        for path in directory.iterdir()
        if path.suffix == ".md" and path.name.lower() != "readme.md"
    }
    readme = directory / "README.md"
    ordered = []
    if readme.exists():
        text = readme.read_text(encoding="utf-8")
        for match in re.finditer(r"\[[^\]]+\]\(\./([^)#]+\.md)", text):
            name = Path(match.group(1)).name
            if name in files and files[name] not in ordered:
                ordered.append(files[name])
    for path in sorted(files.values(), key=lambda item: item.name):
        if path not in ordered:
            ordered.append(path)
    return ordered


def append_question(questions, used_ids, mod, title, body, level, parent_id=None):
    question_id = f"{mod['id']}-{slugify(title)}"
    if parent_id:
        question_id = f"{parent_id}-{slugify(title)}"
    base_id = question_id
    suffix = 2
    while question_id in used_ids:
        question_id = f"{base_id}-{suffix}"
        suffix += 1
    used_ids.add(question_id)
    blocks = parse_blocks(body)
    item = {
        "id": question_id,
        "module": mod["id"],
        "title": title,
        "level": level,
        "summary": make_summary(blocks),
        "blocks": blocks,
    }
    if parent_id:
        item["parentId"] = parent_id
    questions.append(item)
    return question_id


def import_file(questions, used_ids, mod, file_path, level):
    markdown = file_path.read_text(encoding="utf-8-sig")
    title, core_body, extras = split_core_and_extras(markdown)
    question_title = title or file_path.stem
    question_id = append_question(questions, used_ids, mod, question_title, core_body, level)
    for extra in extras:
        append_question(questions, used_ids, mod, extra["title"], extra["body"], "extra", question_id)


def should_skip(file_path):
    name = file_path.name.lower()
    return name.startswith("00.") or name == "readme.md"


def import_module(mod):
    module_dir = SRC_ROOT / mod["dir"]
    questions = []
    used_ids = set()
    interview_files = [path for path in list_markdown_files(module_dir / "面试题") if not should_skip(path)]
    if interview_files:
        for file_path in interview_files:
            import_file(questions, used_ids, mod, file_path, "core")
        return questions

    core_files = list_markdown_files(module_dir / "核心面试题")
    extra_files = list_markdown_files(module_dir / "拓展面试题")
    extra_level = "extra" if core_files else "core"
    for file_path in core_files:
        import_file(questions, used_ids, mod, file_path, "core")
    for file_path in extra_files:
        import_file(questions, used_ids, mod, file_path, extra_level)
    return questions


def main():
    DEST_DIR.mkdir(parents=True, exist_ok=True)
    summary = []
    for mod in MODULES:
        questions = import_module(mod)
        dest = DEST_DIR / f"{mod['id']}.js"
        payload = json.dumps(questions, ensure_ascii=False, separators=(",", ":"))
        dest.write_text(f"module.exports = {payload}\n", encoding="utf-8")
        json_legacy = DEST_DIR / f"{mod['id']}.json"
        if json_legacy.exists():
            json_legacy.unlink()
        summary.append(
            {
                "id": mod["id"],
                "file": str(dest),
                "total": len(questions),
                "core": sum(1 for item in questions if item["level"] == "core"),
                "extra": sum(1 for item in questions if item["level"] == "extra"),
            }
        )
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
