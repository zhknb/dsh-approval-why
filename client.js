// The loader id MUST equal the package name in package.json: the Host looks the
// client half up by package name, and a mismatch fails web boot with
// "duplicate factory registration" plus "import failed".
window.__ModuleLoader__.load({
  id: 'dsh-approval-why',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'approval-why'
    const FACTORY = 'conversation.approval.card'

    /** Client context captured in apply(), for read-only service lookups. */
    let runtime = null

    /** Simplified Chinese is the source of truth for this plugin's copy. */
    const zh = {
      ask: '追问：为什么需要越权？',
      hide: '收起说明',
      heading: '这次越权请求的说明',
      factsLabel: '这次请求的实质',
      factTool: '工具：{toolName}',
      factPerm: '参数里自己要求的权限：{level}',
      factPermNone: '参数没有写明权限级别，由该工具的默认策略决定',
      argsLabel: '系统实际要执行的内容（原始参数）',
      argsPending: '正在读取这次调用的参数……',
      argsMissing: '没能取到这次调用的参数（会话事件还没到），下面只能按理由判断。',
      actionsLabel: '参数里读到的具体动作',
      actionsNone: '没有识别出写文件、删文件、联网或改注册表的动作。',
      whyLabel: '为什么需要越权',
      why_plugin:
        '这条请求要动一个插件：安装会把包文件写进 DSH 的 profile 目录（不在当前工作区内），并调用包管理器安装依赖——依赖的安装脚本会以你的用户身份执行；装好后也没有「只对这次对话生效」的隔离，该 profile 下所有会话都会加载它。也就是说，它要的不是读一个文件，而是往你的工具链里加一段长期生效的代码。',
      why_full:
        '参数里显式要求 danger-full-access：这条命令不再受工作区限制，工作区之外的路径、环境变量、SSH 密钥和令牌文件都在它的读写范围内，而且一次性批准覆盖整条命令，中间没有逐条确认的机会。',
      why_write:
        '这条请求要在工作区之外写入。工作区内的写入当前已经放行，走不到审批；能弹到这里的，是它要碰工作区以外的路径——那可能是系统目录、你的用户目录，或另一个项目。',
      why_fs:
        '这条请求要对工作区之外的文件系统动手（读、写或覆盖）。工作区内的写入本来已经放行，能弹到这里的，是它要碰工作区以外的位置——系统目录、你自己的配置文件，或存着密钥和令牌的文件。文件操作不会在界面上逐行显示改动，覆盖即生效，也没有撤销。',
      why_net:
        '参数里包含联网下载或安装：拉进来的是外部代码，内容不受我控制，安装脚本可能直接在你这台机器上执行。',
      why_command:
        '这条请求要执行一条系统命令：命令以你的用户身份运行，删除、覆盖、联网都发生在 shell 里，界面上看不到中间细节，参数里能读到的只有这一条完整命令。',
      why_tool: '这个工具要做的事落在沙箱允许的范围之外，得你这一次单独授权；它的影响面取决于参数里那几个字段。',
      why_skill:
        '这次要把一段长期生效的指令写进 DSH 的技能目录（DSH_HOME/skills，不在当前工作区内）。它不像工作区里的文档只属于这个项目：之后每个会话启动都会把这段技能描述读进模型上下文，等于往我以后的判断里长期塞一段预先写好的指令，技能正文还可能引导我去执行命令。审批给的是「写进我的配置区」的权利，不是写一个文件。',
      why_schedule:
        '这次要在 DSH 的调度存储里留下一条长期任务（不在工作区内，重启后仍在）。它到点会把一段提示词当作你的消息投递给某个会话，届时我不在你面前、也没人确认，等于把「将来某个时刻自动执行」的权利交出去；在删掉这条任务之前它一直有效。',
      why_goal:
        '这次写的是会话的长期目标记录（DSH 状态目录，不在工作区内），重启后仍会把这条目标当作自动继续的依据。它不会立刻执行危险操作，但会改变我后续每一轮的行为边界。',
      why_agent:
        '这次要开子代理。子代理有自己的上下文和工具权限，会替我连续执行多步操作，workflow 还能一次并行开出很多个；它们的中间过程不会逐条回到这个界面，只有结果回来，所以批准的是「让另一段自动化替我去做」，而不是一次单步操作。',
      why_network:
        '这次要把查询词或完整 URL 发到本机之外的服务商，并取回不受我控制的内容。发出去的东西（包括 URL 里的路径和参数）对对方可见；取回的内容若夹带指令，也会被当成资料读进上下文。它不改你的文件，但会留下外部请求记录。',
      why_read:
        '这是读取类操作，但要读的位置在工作区之外。读本身不改文件，读到的内容会进入我的上下文——如果那是配置、日志或密钥文件，其中的内容随后可能出现在回答里。',
      why_context:
        '这是上下文管理类操作（压缩、还原、检索对话记录、查看缓存），只动本会话的对话数据，不碰工作区文件。影响是对话历史的呈现方式，界面里还能撤回或重做。',
      why_inspect:
        'cordis_inspect_* 读的是当前运行中的 Harness 自身的服务、事件、配置与槽位清单（本机运行时数据，不写盘）。它让我看到本机插件的结构与配置细节，属于「读取我的运行环境」，不是执行。',
      why_ui:
        '这次请求只影响界面交互（向你提问、确认计划、展示文件、维护待办清单），不改文件也不执行命令。它需要审批，通常是因为当前会话处在受限模式，而不是操作本身有破坏性。',
      why_jobs:
        'job_* 管理后台任务：列出任务、读取它的输出、结束正在运行的进程。结束会让它立刻中断（写了一半的文件可能留下半成品），读取输出则把该任务的日志带进上下文。',
      why_office:
        'Office 相关工具会生成或改写 docx / xlsx / pptx / pdf 文件，并可能调用本机的 LibreOffice 做转换与渲染。文件一旦覆盖即生效、没有撤销；如果输出路径在工作区之外，等于把文档写进你的其他目录。',
      why_unknown:
        '注意：这个工具（{toolName}）不在本插件内置的风险说明表里，所以我给不出「这一类操作通常意味着什么」的固定说法，能确定的只有参数本身——下面列出的参数名和内容就是它要做的事，它走到审批是因为沙箱判定它超出了工作区默认权限。遇到没收录的工具，稳妥做法是拒绝这次，再问清楚它到底要做什么、能不能换成已知工具。',
      unknownKeys: '这条请求的参数项：{keys}',
      pathOutside: '（工作区外）',
      pathInside: '（工作区内）',
      whyBody:
        '再补一句方法上的差别：卡片上那段「理由」是我自己写的说明，按固定三段式组织，读起来难免像套话；参数才是系统真正要执行的指令。理由可以写得笼统，参数骗不了人——两者不一致时，以参数为准。',
      denyLabel: '不授权会怎样',
      riskShortLabel: '风险',
      permShortLabel: '需要的权限',
      denyShortLabel: '不授权',
      deny:
        '这条工具调用会直接失败，我收到失败结果后可以换一条不越权的路径重试。参数尚未执行，不存在执行了一半需要回滚的情况；这次拒绝不会被记住，下次需要时仍会重新询问。',
      escalation: '工具 {toolName} 请求越权执行',
      reject: '拒绝',
      allowOnce: '允许一次',
      fallback: '标准审批卡片未能渲染，这里是简化版。',
      originalLabel: '模型给出的完整理由（原文，未改动）',
    }

    const en = {
      ask: 'Why does this need escalation?',
      hide: 'Hide explanation',
      heading: 'About this escalation request',
      factsLabel: 'What this request actually is',
      factTool: 'Tool: {toolName}',
      factPerm: 'Permission the call asks for: {level}',
      factPermNone: 'The call names no permission level; the tool default decides',
      argsLabel: 'What will actually run (raw arguments)',
      argsPending: 'Reading the arguments of this call…',
      argsMissing: 'The arguments of this call are not available yet (the session event has not arrived).',
      actionsLabel: 'Concrete actions found in the arguments',
      actionsNone: 'No file write, delete, network or registry action was recognised.',
      whyLabel: 'Why this needs escalation',
      why_plugin:
        'This request touches a plugin. Installing writes package files into the DSH profile directory — outside this workspace — and runs the package manager to install dependencies, whose install scripts execute as your user. There is no per-conversation isolation either: every session on that profile loads it afterwards. So it is not “read one file”; it is adding long-lived code to your toolchain.',
      why_full:
        'The arguments explicitly ask for danger-full-access: this command is no longer confined to the workspace. Paths outside it, environment variables, SSH keys and token files all fall inside its read/write range, and one approval covers the whole command with no per-step confirmation in between.',
      why_write:
        'This request writes outside the workspace. Writes inside it are already allowed and never reach an approval, so what got here is a path outside the workspace — a system directory, your user profile, or another project.',
      why_fs:
        'This request touches the file system outside the workspace (read, write or overwrite). Writes inside the workspace are already allowed, so what got here is a location outside it — a system directory, your own configuration files, or files holding keys and tokens. File operations show no line-by-line diff in the UI, an overwrite takes effect immediately, and there is no undo.',
      why_net:
        'The arguments include a network download or install: what comes in is external code I do not control, and its install scripts may run directly on this machine.',
      why_command:
        'This request runs a system command. It executes as your user; deletes, overwrites and network access all happen inside the shell where the UI shows no intermediate detail, and the arguments hold only that one full command line.',
      why_tool: 'What this tool does falls outside what the sandbox allows, so it needs a one-off approval; its blast radius is whatever the arguments below actually name.',
      why_skill:
        'This writes a long-lived instruction file into the DSH skills directory (DSH_HOME/skills, outside this workspace). Unlike a document in the workspace, it is not scoped to this project: every later session loads that skill description into the model context, which means planting pre-written instructions into my future judgement — and a skill body can steer me into running commands. The approval grants a write into my configuration area, not into one file.',
      why_schedule:
        'This leaves a long-lived task in the DSH schedule store (outside the workspace, surviving restarts). At its time it delivers a prompt to some session as if it were your message, with nobody present to confirm. Until that task is deleted it stays armed — the approval grants "run by itself at some future moment".',
      why_goal:
        'This writes a session-level goal record (DSH state directory, outside the workspace) that survives restarts and becomes the basis for automatic continuation. It runs nothing dangerous right now, but it moves the boundary of what I do on every later round.',
      why_agent:
        'This starts a subagent. A subagent has its own context and tool permissions and runs many steps on my behalf; workflow can fan out several at once. Their intermediate steps never appear here one by one — only results come back — so you are approving "let another automation act for me", not a single step.',
      why_network:
        'This sends search terms or a full URL to a service outside this machine and brings back content I do not control. What leaves is visible to the recipient (including paths and query parameters in the URL); what comes back may carry instructions that later get read as material. It changes no local file, but it does leave a record of external requests.',
      why_read:
        'This is a read, but from outside the workspace. Reading changes nothing on disk; what is read enters my context, so if it is a config, log or key file its contents may surface in later answers.',
      why_context:
        'This is context management (compressing, restoring or searching this conversation, inspecting the cache). It touches only this session\'s conversation data, not workspace files, and the effect — how history is presented — can still be undone in the UI.',
      why_inspect:
        'cordis_inspect_* reads the running Harness itself: its services, events, configuration and slot tree (live runtime data, nothing written to disk). It lets me see how local plugins are wired, which is reading your runtime, not executing in it.',
      why_ui:
        'This request only affects UI interaction (asking you, confirming a plan, presenting files, maintaining the todo list). It changes no file and runs no command; it needs an approval usually because the session is in a restricted mode, not because the action is destructive.',
      why_jobs:
        'job_* manages background jobs: listing them, reading their output, killing a running process. Killing stops it immediately (a half-written file may be left behind); reading brings that job\'s log into the context.',
      why_office:
        'Office tools create or rewrite docx / xlsx / pptx / pdf files and may invoke the local LibreOffice for conversion and rendering. An overwritten file takes effect at once with no undo, and an output path outside the workspace writes documents into your other folders.',
      why_unknown:
        'Note: the tool {toolName} is not in this plugin\'s built-in risk table, so I cannot give the usual "what this class of action means" paragraph — the only certain facts are the arguments below. It reached an approval because the sandbox judged it outside the default workspace permission. For an unlisted tool the safe move is to reject this call and ask what it is meant to do, or whether a known tool can do the same job.',
      unknownKeys: 'Arguments of this request: {keys}',
      pathOutside: ' (outside the workspace)',
      pathInside: ' (inside the workspace)',
      whyBody:
        'One methodological point: the reason on the card is my own prose, written to a fixed three-part template, so it can read like boilerplate; the arguments are the instruction the system will really run. Prose can stay vague, arguments cannot — when they disagree, the arguments win.',
      denyLabel: 'If you refuse',
      riskShortLabel: 'Risk',
      permShortLabel: 'Permission needed',
      denyShortLabel: 'If refused',
      deny:
        'The call fails at once. I receive the failure and can retry a path that stays inside the workspace. Nothing has run yet, so there is no half-done work to roll back, and the refusal is not remembered — the next need asks again.',
      escalation: 'Tool {toolName} requests privileged execution',
      reject: 'Reject',
      allowOnce: 'Allow once',
      fallback: 'The standard approval card did not render; this is the simplified fallback.',
      originalLabel: 'Full reason as written by the model (unedited)',
    }

    const tokens = {
      text: 'var(--dsw-alias-label-primary)',
      subtle: 'var(--dsw-alias-label-secondary)',
      faint: 'var(--dsw-alias-label-tertiary)',
      line: 'var(--dsw-alias-state-warn-secondary)',
      fill: 'var(--dsw-specific-input-major)',
      sideClearance: 'var(--dsh-composer-side-clearance)',
      contentWidth: 'var(--dsh-chat-content-width)',
    }

    /** Resolve the asker-supplied localized reason, never throwing into render. */
    function resolveReason(slot, pending) {
      if (pending.displayReason !== undefined && typeof slot.resolveReason === 'function') {
        try {
          return slot.resolveReason(pending.displayReason)
        } catch (error) {
          const fallback = pending.displayReason.zh || pending.displayReason.en
          if (typeof fallback === 'string') return fallback
        }
      }
      if (typeof pending.reason === 'string') return pending.reason
      return undefined
    }

    /** One labelled section inside the explanation panel: label on its own line, body below. */
    function Row({ label, children }) {
      return h(
        'div',
        { style: { display: 'block', marginTop: 10 } },
        h(
          'div',
          { style: { color: tokens.faint, fontSize: 12, lineHeight: '18px', marginBottom: 2 } },
          label,
        ),
        h(
          'div',
          {
            style: {
              display: 'block',
              color: tokens.subtle,
              fontSize: 13,
              lineHeight: '20px',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
            },
          },
          children,
        ),
      )
    }

    /** Monospaced, scrollable block for raw tool arguments. */
    function Mono({ children }) {
      return h(
        'pre',
        {
          style: {
            margin: 0,
            padding: '8px 10px',
            border: `1px solid ${tokens.line}`,
            borderRadius: 8,
            background: tokens.fill,
            color: tokens.text,
            fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
            fontSize: 12,
            lineHeight: '18px',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            maxHeight: 'min(14vh, 120px)',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
          },
        },
        children,
      )
    }

    /** Latest tool/call event of the live session, matched by callId when given. */
    function readToolCall(sessionId, callId) {
      try {
        const sessions = runtime && runtime.sessions
        if (!sessions || typeof sessions.binding !== 'function') return null
        const binding = sessions.binding(sessionId)
        const source = binding && binding.eventSource
        if (!source || typeof source.getSnapshot !== 'function') return null
        const snapshot = source.getSnapshot()
        const entries = (snapshot && snapshot.entries) || []
        for (let index = entries.length - 1; index >= 0; index -= 1) {
          const event = entries[index] && entries[index].event
          if (!event || event.type !== 'tool/call') continue
          const data = event.data || {}
          if (callId !== undefined && callId !== null && data.callId !== callId) continue
          return data
        }
      } catch (error) {
        return null
      }
      return null
    }

    /**
     * The directory the session runs in, taken from the cwd recorded on earlier tool
     * results. Used only to say whether a path in the arguments is inside it.
     */
    function readWorkspaceRoot(sessionId) {
      try {
        const sessions = runtime && runtime.sessions
        if (!sessions || typeof sessions.binding !== 'function') return undefined
        const binding = sessions.binding(sessionId)
        const source = binding && binding.eventSource
        if (!source || typeof source.getSnapshot !== 'function') return undefined
        const snapshot = source.getSnapshot()
        const entries = (snapshot && snapshot.entries) || []
        for (let index = entries.length - 1; index >= 0; index -= 1) {
          const event = entries[index] && entries[index].event
          const meta = event && event.data && event.data.meta
          if (meta && typeof meta.cwd === 'string' && meta.cwd !== '') return meta.cwd
        }
      } catch (error) {
        return undefined
      }
      return undefined
    }

    /** Whether an absolute path sits under the workspace root (case-insensitive). */
    function isInside(root, path) {
      if (typeof root !== 'string' || root === '') return undefined
      const normalise = (value) => String(value).replace(/[\\/]+/g, '\\').replace(/\\+$/, '').toLowerCase()
      const base = normalise(root)
      const target = normalise(path)
      return target === base || target.indexOf(base + '\\') === 0
    }

    /** Re-read the tool call whenever the session event window changes. */
    function useToolCall(sessionId, callId) {
      const [data, setData] = React.useState(null)
      const [, bump] = React.useReducer((value) => value + 1, 0)
      React.useEffect(() => {
        setData(readToolCall(sessionId, callId))
        let off = () => {}
        try {
          const sessions = runtime && runtime.sessions
          const binding = sessions && typeof sessions.binding === 'function' ? sessions.binding(sessionId) : null
          const source = binding && binding.eventSource
          if (source && typeof source.subscribe === 'function') {
            const subscription = source.subscribe(() => bump())
            if (typeof subscription === 'function') off = subscription
          }
        } catch (error) {
          off = () => {}
        }
        return () => {
          try {
            off()
          } catch (error) {
            /* the window outlived this component; nothing to release */
          }
        }
      }, [sessionId, callId])
      React.useEffect(() => {
        setData(readToolCall(sessionId, callId))
      })
      return data
    }

    const PATH_PATTERN = /(?:[A-Za-z]:[\\/][^\s"'`,;)]*|\\\\[^\s"'`,;]+|\/(?:[\w.@-]+\/)+[\w.@-]+)/g

    /** Syntax-level signals worth naming next to the raw arguments. */
    const ACTION_RULES = [
      { pattern: /Remove-Item|\brmdir\b|\brm\b|\bdel\b|\bunlink\b|RemoveDirectory/i, label: '删除文件或目录' },
      { pattern: /Set-Content|Out-File|Add-Content|New-Item|\bmkdir\b|\bcopy\b|\bcp\b|\bmv\b|\bmove\b/i, label: '写入 / 覆盖 / 移动文件' },
      { pattern: /Start-Process|Invoke-Expression|\biex\b|\bcmd\s*\/c\b|child_process|spawn\(/i, label: '启动外部程序' },
      { pattern: /Invoke-WebRequest|Invoke-RestMethod|\bcurl\b|\bwget\b|git\s+clone|npm\s+(i|install)|pip\s+install/i, label: '联网下载或安装' },
      { pattern: /plugin_manager|install_bundle|uninstall_bundle/i, label: '改动 Harness 插件配置' },
      { pattern: /reg\s+(add|delete|query)|Set-ItemProperty|HKLM|HKCU/i, label: '改动注册表' },
    ]

    const ACTION_LABELS_EN = {
      '删除文件或目录': 'delete files or directories',
      '写入 / 覆盖 / 移动文件': 'write, overwrite or move files',
      '启动外部程序': 'start an external program',
      '联网下载或安装': 'download or install over the network',
      '改动 Harness 插件配置': 'change the Harness plugin configuration',
      '改动注册表': 'change the registry',
    }

    /** Paths named in the arguments plus the action verbs they use. */
    function inspectArguments(text) {
      const paths = []
      if (typeof text === 'string' && text !== '') {
        PATH_PATTERN.lastIndex = 0
        let match = PATH_PATTERN.exec(text)
        while (match !== null && paths.length < 6) {
          const value = match[0].replace(/[.,]+$/, '')
          if (value.length >= 3 && paths.indexOf(value) === -1) paths.push(value)
          match = PATH_PATTERN.exec(text)
        }
      }
      const actions = []
      for (const rule of ACTION_RULES) {
        if (rule.pattern.test(text || '') && actions.indexOf(rule.label) === -1) actions.push(rule.label)
      }
      return { paths, actions }
    }

    /**
     * Risk family per tool, so the "why" paragraph can name the real blast radius
     * instead of a generic sentence. Every tool this Harness can hand to the model
     * is listed here; anything new falls back to `unknown`, which says so out loud
     * and shows the argument names rather than pretending to know.
     */
    const TOOL_KINDS = {
      pwsh: 'command', powershell: 'command', bash: 'command', shell: 'command',
      sh: 'command', cmd: 'command', zsh: 'command', node: 'command',
      python: 'command', python3: 'command',
      write: 'fs', edit: 'fs',
      read: 'read', read_image: 'read', glob: 'read', grep: 'read', ocr_image: 'read',
      working_directory: 'read', load_workspace_dependencies: 'read',
      create_skill: 'skill', skill: 'skill',
      plugin_manager: 'plugin',
      schedule_create: 'schedule', schedule_edit: 'schedule',
      schedule_list: 'schedule', schedule_view: 'schedule',
      create_goal: 'goal', update_goal: 'goal', get_goal: 'goal',
      subagent: 'agent', subagent_fork: 'agent', workflow: 'agent', send_message: 'agent',
      interrupt_agent: 'agent', list_agents: 'agent', list_subagent_models: 'agent',
      web_search: 'network', web_fetch: 'network',
      compress: 'context', decompress: 'context', search_context: 'context',
      acp_status: 'context', acp_cache: 'context', acp_read_original_image: 'context',
      cordis_inspect_list: 'inspect', cordis_inspect_query: 'inspect',
      ask_user_question: 'ui', exit_plan_mode: 'ui', present: 'ui', todo_write: 'ui',
      job_list: 'jobs', job_output: 'jobs', job_kill: 'jobs',
    }

    /** The escalation's risk family: known table first, then permission level, then heuristics. */
    function classifyTool(toolName, raw, insights, requested) {
      const tool = String(toolName || '')
      const text = typeof raw === 'string' ? raw : ''
      if (/plugin_manager/i.test(tool) || /plugin_manager|install_bundle|uninstall_bundle/.test(text)) {
        return { kind: 'plugin' }
      }
      const known = TOOL_KINDS[tool.toLowerCase()]
      if (known !== undefined) return { kind: known }
      if (/^office[-_]/i.test(tool)) return { kind: 'office' }
      if (requested === 'danger-full-access') return { kind: 'full' }
      if (requested === 'workspace-write') return { kind: 'write' }
      if (insights.actions.indexOf('联网下载或安装') !== -1) return { kind: 'net' }
      if (/^(write|edit|read|glob|grep|office|skill)$/i.test(tool)) return { kind: 'fs' }
      return { kind: 'unknown' }
    }

    /** Top-level argument names, the last resort when the tool itself is unlisted. */
    function argumentKeys(text) {
      if (typeof text !== 'string' || text === '') return []
      try {
        const parsed = JSON.parse(text)
        if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) return Object.keys(parsed)
      } catch (error) {
        return []
      }
      return []
    }

    /** The one-sentence judgement: which of this call's paths actually fall outside. */
    function concreteWhy(lang, root, paths, outside, requested, toolName) {
      const zh = lang !== 'en'
      if (paths.length === 0) {
        return zh
          ? `参数里没有出现路径，所以这次越权不是某个文件引起的，而是工具 ${toolName} 本身只能在沙箱之外执行。`
          : `No path appears in the arguments, so this escalation is not about a file: the tool ${toolName} itself can only run outside the sandbox.`
      }
      if (outside > 0) {
        return zh
          ? `判断依据：上面 ${paths.length} 个路径里有 ${outside} 个不在工作区（${root || '未知'}）之内，而沙箱只放开了工作区内的写入——这次审批就是为那几个外面的路径。`
          : `${outside} of the ${paths.length} paths above sit outside the workspace (${root || 'unknown'}), and the sandbox only allows writes inside it — that is what this approval covers.`
      }
      return zh
        ? `判断依据：上面 ${paths.length} 个路径都在工作区（${root || '未知'}）之内。也就是说提权与路径无关，是参数里要求的 ${requested || '更高权限'} 让整条命令脱离沙箱，参数里看不出它具体要碰什么。`
        : `All ${paths.length} paths above are inside the workspace (${root || 'unknown'}). So the escalation is not about a path: the ${requested || 'higher permission'} in the arguments takes the whole command out of the sandbox, and the arguments do not reveal what it will touch.`
    }

    /** Pretty-print JSON arguments when possible, otherwise pass the text through. */
    function formatArguments(value) {
      if (typeof value === 'string') {
        try {
          return JSON.stringify(JSON.parse(value), null, 2)
        } catch (error) {
          return value
        }
      }
      if (value === undefined || value === null) return undefined
      try {
        return JSON.stringify(value, null, 2)
      } catch (error) {
        return String(value)
      }
    }

    /**
     * JSON escapes newlines inside string values as two characters, "\n", so a
     * multi-line justification shows up as one run-on line. For reading only, turn
     * those escapes back into real breaks; the JSON structure is otherwise intact.
     */
    function readableArguments(text) {
      if (typeof text !== 'string') return text
      return text.replace(/\\r\\n|\\n/g, '\n').replace(/\\t/g, '\t')
    }

    /** The expanded explanation: what will really run and why that is out of bounds. */
    function Explanation({ t, lang, pending, onClose }) {
      const call = useToolCall(pending.sessionId, pending.callId)
      const raw = call === null || call === undefined ? undefined : call.arguments
      const pretty = readableArguments(formatArguments(raw))
      const insights = inspectArguments(pretty || '')
      let requested
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (parsed && typeof parsed === 'object' && parsed.sandbox_permissions !== undefined) {
          requested = String(parsed.sandbox_permissions)
        }
      } catch (error) {
        requested = undefined
      }
      const says = (zhText, enText) => (lang === 'en' ? enText : zhText)
      const root = readWorkspaceRoot(pending.sessionId)
      let outside = 0
      const placeOf = (path) => {
        const inside = isInside(root, path)
        if (inside === undefined) return ''
        if (inside) return says(zh.pathInside, en.pathInside)
        outside += 1
        return says(zh.pathOutside, en.pathOutside)
      }
      const places = insights.paths.map((path) => placeOf(path))
      const risk = classifyTool(pending.toolName, pretty, insights, requested)
      const riskKeys = risk.kind === 'unknown' ? argumentKeys(pretty) : []

      return h(
        'div',
        {
          style: {
            alignSelf: 'center',
            width: '100%',
            maxWidth: tokens.contentWidth,
            boxSizing: 'border-box',
            margin: `0 calc(${tokens.sideClearance} + 16px) 8px`,
            border: `1px solid ${tokens.line}`,
            borderRadius: 12,
            background: tokens.fill,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'min(32vh, var(--dsh-composer-text-max-height, 260px))',
            overflow: 'hidden',
          },
          role: 'note',
        },
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              flexShrink: 0,
              padding: '8px 12px',
              borderBottom: `1px solid ${tokens.line}`,
            },
          },
          h('span', { style: { color: tokens.text, fontSize: 13, fontWeight: 600, lineHeight: '20px' } }, t('heading')),
          h(
            'button',
            {
              type: 'button',
              onClick: onClose,
              style: {
                flexShrink: 0,
                padding: '2px 6px',
                border: 'none',
                borderRadius: 6,
                background: 'transparent',
                color: tokens.subtle,
                fontSize: 12,
                lineHeight: '18px',
                cursor: 'pointer',
              },
            },
            t('hide'),
          ),
        ),
        h(
          'div',
          {
            style: {
              flex: '1 1 auto',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              minHeight: 0,
              padding: '0 12px 12px',
            },
          },
          h(
            Row,
            { label: t('factsLabel') },
            t('factTool', { toolName: pending.toolName || '' }),
            '；',
            requested === undefined ? t('factPermNone') : t('factPerm', { level: requested }),
          ),
          h(
            Row,
            { label: t('argsLabel') },
            pretty === undefined
              ? t('argsMissing')
              : h(Mono, null, pretty),
          ),
          insights.paths.length === 0 && insights.actions.length === 0
            ? null
            : h(
                Row,
                { label: t('actionsLabel') },
                insights.actions.length === 0
                  ? null
                  : insights.actions.map((label, index) =>
                      h(
                        'div',
                        { key: `a${String(index)}` },
                        `· ${says(label, ACTION_LABELS_EN[label] || label)}`,
                      ),
                    ),
                insights.paths.length === 0
                  ? null
                  : h(
                      'div',
                      { style: { marginTop: insights.actions.length === 0 ? 0 : 4 } },
                      `${says('涉及路径', 'Paths involved')}：`,
                      h(
                        'div',
                        { style: { marginTop: 2 } },
                        insights.paths.map((path, index) =>
                          h(
                            'div',
                            {
                              key: `p${String(index)}`,
                              style: {
                                fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
                                fontSize: 12,
                                lineHeight: '18px',
                                overflowWrap: 'anywhere',
                              },
                            },
                            path,
                            places[index] === '' ? null : h('span', { style: { color: tokens.faint } }, places[index]),
                          ),
                        ),
                      ),
                    ),
              ),
          h(
            Row,
            { label: t('whyLabel') },
            concreteWhy(lang, root, insights.paths, outside, requested, pending.toolName || ''),
            h(
              'div',
              { style: { marginTop: 6 } },
              t(`why_${risk.kind}`, { toolName: pending.toolName || '' }),
            ),
            risk.kind === 'unknown' && riskKeys.length > 0
              ? h(
                  'div',
                  { style: { marginTop: 4, color: tokens.subtle } },
                  t('unknownKeys', { keys: riskKeys.join(lang === 'en' ? ', ' : '、') }),
                )
              : null,
            h('div', { style: { marginTop: 6, color: tokens.faint } }, t('whyBody')),
          ),
          h(Row, { label: t('denyLabel') }, t('deny')),
        ),
      )
    }

    /** Simplified card used only when the shipped approval factory cannot render. */
    function FallbackCard({ t, toolName, canAnswer, onAllow, onReject }) {
      const button = (label, primary, action) =>
        h(
          'button',
          {
            type: 'button',
            disabled: !canAnswer,
            onClick: action,
            style: {
              padding: '5px 14px',
              borderRadius: 8,
              border: `1px solid ${primary ? 'transparent' : tokens.line}`,
              background: primary ? tokens.text : 'transparent',
              color: primary ? tokens.fill : tokens.text,
              fontSize: 13,
              lineHeight: '20px',
              cursor: canAnswer ? 'pointer' : 'default',
              opacity: canAnswer ? 1 : 0.5,
            },
          },
          label,
        )
      return h(
        'div',
        {
          style: {
            alignSelf: 'center',
            width: '100%',
            maxWidth: tokens.contentWidth,
            boxSizing: 'border-box',
            margin: `0 calc(${tokens.sideClearance} + 16px)`,
            padding: '12px 16px',
            border: `1px solid ${tokens.line}`,
            borderRadius: 12,
            background: tokens.fill,
          },
        },
        h('div', { style: { color: tokens.text, fontSize: 15, lineHeight: '24px' } }, t('escalation', {
          toolName: toolName || '',
        })),
        h('div', { style: { color: tokens.faint, fontSize: 12, marginTop: 4 } }, t('fallback')),
        h(
          'div',
          { style: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 } },
          button(t('reject'), false, onReject),
          button(t('allowOnce'), true, onAllow),
        ),
      )
    }

    /**
     * Drop the trailing "追问 / Follow-up" invitation from the quoted reason: the
     * approval blocks the model, so that invitation can never be answered here.
     */
    function stripFollowUp(text) {
      const source = String(text)
      const match = /(?:^|\n)\s*(?:[-*•·]\s*)?(?:\*\*)?\s*(?:追问|follow[\s-]?up)\s*(?:\*\*)?\s*[:：]/i.exec(source)
      const body = match ? source.slice(0, match.index) : source
      return body.replace(/\s+$/, '')
    }

    /** Headings the model uses inside a justification, in either language. */
    const REASON_HEADS = [
      ['perm', /^(?:需要的权限|需要权限|权限要求)\s*[:：]\s*/],
      ['risk', /^(?:风险|风险点)\s*[:：]\s*/],
      ['deny', /^(?:不授权|不授权的后果|拒绝后果)\s*[:：]\s*/],
      ['follow', /^(?:追问)\s*[:：]\s*/],
      ['perm', /^Permission needed\s*[:：]\s*/i],
      ['risk', /^Risk\s*[:：]\s*/i],
      ['deny', /^If you refuse\s*[:：]\s*/i],
      ['follow', /^Follow[\s-]?up\s*[:：]\s*/i],
    ]

    /**
     * Split a justification into its labelled paragraphs. The escalation template
     * asks the model to write "需要的权限 / 风险 / 不授权" itself, so without this
     * the same facts would be printed twice: once by the summary lines and again
     * in the original text. Returns the paragraphs (labels split out) and whether
     * the text already covers the risk and the refusal.
     */
    function parseReason(text) {
      const source = text === undefined || text === null ? '' : readableArguments(String(text))
      const cleaned = stripFollowUp(source)
      if (cleaned.trim() === '') return { blocks: [], hasRisk: false, hasDeny: false }
      const spaced = cleaned.replace(
        /([。；;：])\s*(?=(?:需要的权限|风险|不授权|追问|Permission needed|Risk|If you refuse|Follow[\s-]?up)\s*[:：])/gi,
        '$1\n',
      )
      const blocks = []
      let current = { kind: 'text', lines: [] }
      const flush = () => {
        if (current.lines.length > 0 || current.kind !== 'text') blocks.push(current)
      }
      for (const raw of spaced.split(/\r?\n/)) {
        const line = raw.trim()
        if (line === '') continue
        let head = null
        for (const entry of REASON_HEADS) {
          const match = entry[1].exec(line)
          if (match !== null) {
            head = { kind: entry[0], rest: line.slice(match[0].length) }
            break
          }
        }
        if (head !== null) {
          flush()
          current = { kind: head.kind, lines: head.rest === '' ? [] : [head.rest] }
          continue
        }
        current.lines.push(line)
      }
      flush()
      const visible = blocks
        .filter((block) => block.kind !== 'follow')
        .map((block) => ({ kind: block.kind, text: block.lines.join('\n') }))
        .filter((block) => block.text !== '')
      return {
        blocks: visible,
        hasRisk: visible.some((block) => block.kind === 'risk'),
        hasDeny: visible.some((block) => block.kind === 'deny'),
      }
    }

    /**
     * The asker's own words, complete and unedited. The shipped card collapses
     * newlines and truncates its headline, so the full text gets its own block.
     * Labelled paragraphs keep their heading on a faint line above the body, which
     * makes the text scannable without duplicating the summary above.
     */
    function OriginalBlock({ t, parsed }) {
      if (parsed.blocks.length === 0) return null
      const labelFor = (kind) =>
        kind === 'perm'
          ? t('permShortLabel')
          : kind === 'risk'
            ? t('riskShortLabel')
            : kind === 'deny'
              ? t('denyShortLabel')
              : ''
      const body = {
        color: tokens.subtle,
        fontSize: 13,
        lineHeight: '20px',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
      }
      return h(
        'div',
        {
          style: {
            alignSelf: 'center',
            width: '100%',
            maxWidth: tokens.contentWidth,
            boxSizing: 'border-box',
            margin: '8px 0 0',
            padding: '8px 16px 10px',
            border: `1px dashed ${tokens.line}`,
            borderRadius: 12,
          },
        },
        h(
          'div',
          { style: { color: tokens.faint, fontSize: 12, lineHeight: '18px', marginBottom: 2 } },
          t('originalLabel'),
        ),
        h(
          'div',
          {
            style: {
              maxHeight: 'min(20vh, 150px)',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
            },
          },
          parsed.blocks.map((block, index) =>
            h(
              'div',
              { key: index, style: { marginTop: index === 0 ? 2 : 8 } },
              block.kind === 'text'
                ? null
                : h(
                    'div',
                    { style: { color: tokens.faint, fontSize: 12, lineHeight: '18px', marginBottom: 1 } },
                    labelFor(block.kind),
                  ),
              h('div', { style: body }, block.text),
            ),
          ),
        ),
      )
    }

    /**
     * One-line risk per category, shown under the card without opening the
     * panel. The card's own reason can be a single sentence (some tools raise
     * their own approval with a terse reason), so the risk and the refusal
     * consequence have to be readable at a glance.
     */
    const SHORT_RISK = {
      zh: {
        command: '以你的用户身份跑系统命令：删除、覆盖、联网都发生在 shell 里，界面上看不到中间细节。',
        fs: '读写工作区之外的文件，覆盖即生效，没有撤销。',
        write: '往工作区之外写文件，覆盖不可恢复。',
        full: '整条命令脱离沙箱，工作区外的路径、环境变量和凭据文件都在它的读写范围内。',
        net: '联网下载或安装外部代码，安装脚本可能直接在本机执行。',
        plugin: '往工具链里装长期生效的代码，该 profile 下所有会话以后都会加载它。',
        skill: '写进全局技能目录，所有会话长期生效；技能正文会被我当指令读。',
        schedule: '写入定时任务，之后到点会自动触发。',
        goal: '写入长期目标，之后会自动续跑。',
        agent: '派生子代理，它会自己去调用工具。',
        office: '生成或改写文档文件，可能覆盖原文件。',
        read: '读取工作区之外的文件内容。',
        context: '改动这次会话的上下文或摘要。',
        inspect: '读取运行时内部状态（服务、事件、槽位、工具定义）。',
        ui: '改动界面布局或设置。',
        jobs: '管理后台任务进程。',
        tool: '影响面取决于参数字段，具体见下方原始参数。',
        unknown: '这个工具没有收录在插件的风险表里，影响面只能按参数字段推断（下方已列出）。',
      },
      en: {
        command: 'Runs a system command as your user: deletes, overwrites and network access happen inside the shell, with no detail in the UI.',
        fs: 'Reads or writes files outside the workspace; an overwrite takes effect immediately and cannot be undone.',
        write: 'Writes files outside the workspace; an overwrite is not recoverable.',
        full: 'The whole command leaves the sandbox: paths outside the workspace, environment variables and credential files are all in range.',
        net: 'Downloads or installs external code; its install scripts may run directly on this machine.',
        plugin: 'Adds long-lived code to your toolchain; every session on this profile loads it afterwards.',
        skill: 'Writes into the global skills directory; it applies to every session, and I read the body as instructions.',
        schedule: 'Writes a scheduled task that will fire on its own later.',
        goal: 'Writes a long-running goal that will continue automatically.',
        agent: 'Spawns a subagent that calls tools on its own.',
        office: 'Creates or rewrites document files; the original may be overwritten.',
        read: 'Reads file content outside the workspace.',
        context: 'Changes this session’s context or summary.',
        inspect: 'Reads runtime internals (services, events, slots, tool definitions).',
        ui: 'Changes the interface layout or settings.',
        jobs: 'Manages background job processes.',
        tool: 'The impact depends on the argument fields — see the raw arguments below.',
        unknown: 'This tool is not in the plugin’s risk table; the impact is inferred from its argument fields (listed below).',
      },
    }

    const SHORT_DENY = {
      zh: '这次调用直接失败，参数不会执行，也不会留下改了一半的东西；我可以换一条不越权的路径重试。',
      en: 'The call fails, nothing runs, and no half-finished change is left behind; I can retry a path that stays inside the sandbox.',
    }

    /** Always-visible risk line: what this category actually touches. */
    function shortRisk(kind, lang) {
      const table = SHORT_RISK[lang === 'en' ? 'en' : 'zh']
      return table[kind] === undefined ? table.tool : table[kind]
    }

    /**
     * Two faint lines under the card: risk, then what refusing means. The block
     * copies the card's own geometry (centred, capped at the chat content width)
     * so it lines up with the card instead of hugging the window edge.
     */
    function ShortSummary({ t, lang, kind }) {
      const line = (label, text) =>
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'baseline',
              gap: 8,
              marginTop: 2,
            },
          },
          h(
            'span',
            {
              style: {
                flex: '0 0 auto',
                width: 56,
                color: tokens.subtle,
                fontSize: 12,
                lineHeight: '19px',
              },
            },
            label,
          ),
          h(
            'span',
            {
              style: {
                flex: '1 1 auto',
                minWidth: 0,
                color: tokens.faint,
                fontSize: 12,
                lineHeight: '19px',
                whiteSpace: 'normal',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              },
            },
            text,
          ),
        )
      return h(
        'div',
        {
          style: {
            alignSelf: 'center',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: tokens.contentWidth,
            boxSizing: 'border-box',
            margin: `8px 0 0`,
            padding: '0 16px',
          },
        },
        line(t('riskShortLabel'), shortRisk(kind, lang)),
        line(t('denyShortLabel'), lang === 'en' ? SHORT_DENY.en : SHORT_DENY.zh),
      )
    }

    /** Composer takeover for one pending approval; remounted per request key. */
    function ApprovalWhy({ pending, slot }) {
      const t = typeof slot.t === 'function' ? slot.t : (key) => key
      const lang = (() => {
        try {
          return typeof slot.t === 'function' && String(slot.t('ask')) === en.ask ? 'en' : 'zh'
        } catch (error) {
          return 'zh'
        }
      })()
      const [open, setOpen] = React.useState(false)
      const [hover, setHover] = React.useState(false)
      const reason = resolveReason(slot, pending)
      const kind = classifyTool(pending.toolName, '', { paths: [], actions: [] }, undefined).kind
      const parsed = parseReason(reason)
      const canAnswer = pending.answerable === true
      const onAllow = () => pending.answer('allowed-once')
      const onReject = () => pending.answer('rejected')

      let card
      if (typeof slot.renderFactorySlot === 'function') {
        try {
          card = slot.renderFactorySlot(FACTORY, {
            requestKey: pending.key,
            title: t('escalation', { toolName: pending.toolName || '' }),
            ...(pending.callId === undefined ? {} : { callId: pending.callId }),
            canAnswer: () => pending.answerable === true,
            onAllow,
            onReject,
          })
        } catch (error) {
          card = null
        }
      }
      if (card === null || card === undefined) {
        card = h(FallbackCard, { t, toolName: pending.toolName, canAnswer, onAllow, onReject })
      }

      return h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            minWidth: 0,
          },
        },
        h(
          'div',
          {
            style: {
              alignSelf: 'center',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              width: '100%',
              maxWidth: tokens.contentWidth,
              boxSizing: 'border-box',
              padding: '2px 16px 6px',
            },
          },
          h(
            'button',
            {
              type: 'button',
              'aria-expanded': open,
              onClick: () => setOpen((value) => !value),
              onMouseEnter: () => setHover(true),
              onMouseLeave: () => setHover(false),
              style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                border: `1px solid ${tokens.line}`,
                borderRadius: 999,
                background: hover ? tokens.fill : 'transparent',
                color: tokens.text,
                fontSize: 12,
                lineHeight: '18px',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              },
            },
            h('span', { 'aria-hidden': 'true', style: { opacity: 0.7 } }, '?'),
            open ? t('hide') : t('ask'),
          ),
        ),
        open ? h(Explanation, { t, lang, pending, onClose: () => setOpen(false) }) : null,
        card,
        open ? null : parsed.hasRisk && parsed.hasDeny ? null : h(ShortSummary, { t, lang, kind }),
        open ? null : h(OriginalBlock, { t, parsed }),
      )
    }

    /** Chain entry: claim only approval interactions, and remount for each request. */
    function ApprovalWhyEntry(slotProps) {
      const pending = slotProps.matched
      return h(ApprovalWhy, { key: pending.key, pending, slot: slotProps })
    }

    return {
      inject: ['slots', 'sessions', 'locale'],
      apply(ctx) {
        runtime = ctx
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'approval-why: dictionaries')
        ctx.slots.inject('conversation.composer', () =>
          ctx.slots.register(
            {
              name: 'conversation.composer',
              priority: 0.9,
              locale: NS,
              select: ({ pendingInteraction }) => {
                if (pendingInteraction === undefined || pendingInteraction === null) return null
                if (pendingInteraction.kind !== 'approval') return null
                return pendingInteraction
              },
              inject: () => ({
                resolveReason: (reason) =>
                  typeof ctx.locale.resolveText === 'function'
                    ? ctx.locale.resolveText(reason)
                    : reason && typeof reason === 'object'
                      ? reason.zh || reason.en
                      : String(reason),
              }),
            },
            ApprovalWhyEntry,
          ),
        )
      },
    }
  },
})
