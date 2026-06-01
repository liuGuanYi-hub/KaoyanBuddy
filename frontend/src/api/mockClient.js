const STATE_KEY = 'kaoyan_buddy_mock_state';
const TOKEN_PREFIX = 'mock-token-';

const seedSubjects = [
  { name: '英语', category: '公共课', color: '#22c55e', targetHours: 180 },
  { name: '政治', category: '公共课', color: '#f59e0b', targetHours: 120 },
  { name: '数学', category: '公共课', color: '#38bdf8', targetHours: 220 },
  { name: '专业课', category: '专业课', color: '#a78bfa', targetHours: 260 },
];

const seedTaskTitles = {
  英语: ['阅读真题精读', '长难句拆解'],
  政治: ['选择题知识点复盘', '时政材料整理'],
  数学: ['高数基础题限时练', '错题归因整理'],
  专业课: ['核心章节框架复述', '名词解释背诵'],
};

export const mockApi = {
  async register(payload) {
    await delay();
    const state = loadState();
    const username = payload.username.trim();
    const email = payload.email.trim().toLowerCase();

    if (state.users.some((user) => user.username === username)) {
      throw apiError('用户名已被使用', 400);
    }
    if (state.users.some((user) => user.email === email)) {
      throw apiError('邮箱已被使用', 400);
    }

    const user = {
      id: nextId(state, 'userSeq'),
      username,
      email,
      createdAt: now(),
    };
    state.users.push(user);
    ensureUserSeed(state, user.id);
    saveState(state);

    return { token: tokenFor(user.id), user };
  },

  async login(payload) {
    await delay();
    const state = loadState();
    const username = payload.username.trim();
    if (!username || !payload.password) {
      throw apiError('请输入用户名和密码', 400);
    }

    let user = state.users.find((item) => item.username === username);
    if (!user) {
      user = {
        id: nextId(state, 'userSeq'),
        username,
        email: `${username}@mock.local`,
        createdAt: now(),
      };
      state.users.push(user);
    }

    ensureUserSeed(state, user.id);
    saveState(state);
    return { token: tokenFor(user.id), user };
  },

  async me() {
    await delay(80);
    const { user } = requireUser();
    return user;
  },

  async listSubjects() {
    await delay();
    const { state, user } = requireUser();
    ensureUserSeed(state, user.id);
    saveState(state);
    return clone(state.subjects.filter((subject) => subject.userId === user.id).map(publicSubject));
  },

  async createSubject(payload) {
    await delay();
    const { state, user } = requireUser();
    const subject = {
      id: nextId(state, 'subjectSeq'),
      userId: user.id,
      name: payload.name.trim(),
      category: payload.category.trim(),
      color: payload.color,
      targetHours: Number(payload.targetHours || 120),
      createdAt: now(),
    };
    state.subjects.push(subject);
    saveState(state);
    return publicSubject(subject);
  },

  async updateSubject(id, payload) {
    await delay();
    const { state, user } = requireUser();
    const subject = findSubject(state, user.id, Number(id));
    Object.assign(subject, {
      name: payload.name.trim(),
      category: payload.category.trim(),
      color: payload.color,
      targetHours: Number(payload.targetHours || subject.targetHours),
    });
    saveState(state);
    return publicSubject(subject);
  },

  async deleteSubject(id) {
    await delay();
    const { state, user } = requireUser();
    const subjectId = Number(id);
    state.subjects = state.subjects.filter((subject) => !(subject.userId === user.id && subject.id === subjectId));
    state.tasks = state.tasks.filter((task) => !(task.userId === user.id && task.subjectId === subjectId));
    saveState(state);
    return null;
  },

  async listTasks(params = {}) {
    await delay();
    const { state, user } = requireUser();
    ensureUserSeed(state, user.id);
    saveState(state);
    return state.tasks
      .filter((task) => task.userId === user.id)
      .filter((task) => !params.date || task.taskDate === params.date)
      .filter((task) => !params.status || task.status === params.status)
      .filter((task) => !params.subjectId || task.subjectId === Number(params.subjectId))
      .sort((a, b) => `${a.taskDate}-${a.id}`.localeCompare(`${b.taskDate}-${b.id}`))
      .map((task) => publicTask(state, task));
  },

  async createTask(payload) {
    await delay();
    const { state, user } = requireUser();
    findSubject(state, user.id, Number(payload.subjectId));
    const task = {
      id: nextId(state, 'taskSeq'),
      userId: user.id,
      subjectId: Number(payload.subjectId),
      title: payload.title.trim(),
      description: payload.description?.trim() || '',
      taskDate: payload.taskDate,
      status: payload.status || 'TODO',
      priority: payload.priority || 'MEDIUM',
      plannedMinutes: Number(payload.plannedMinutes || 60),
      actualMinutes: Number(payload.actualMinutes || 0),
      completedAt: payload.status === 'DONE' ? now() : null,
      createdAt: now(),
    };
    state.tasks.push(task);
    saveState(state);
    return publicTask(state, task);
  },

  async updateTask(id, payload) {
    await delay();
    const { state, user } = requireUser();
    const task = findTask(state, user.id, Number(id));
    findSubject(state, user.id, Number(payload.subjectId));
    Object.assign(task, {
      subjectId: Number(payload.subjectId),
      title: payload.title.trim(),
      description: payload.description?.trim() || '',
      taskDate: payload.taskDate,
      status: payload.status || task.status,
      priority: payload.priority || task.priority,
      plannedMinutes: Number(payload.plannedMinutes || task.plannedMinutes),
      actualMinutes: Number(payload.actualMinutes ?? task.actualMinutes),
    });
    task.completedAt = task.status === 'DONE' ? task.completedAt || now() : null;
    saveState(state);
    return publicTask(state, task);
  },

  async updateTaskStatus(id, payload) {
    await delay();
    const { state, user } = requireUser();
    const task = findTask(state, user.id, Number(id));
    task.status = payload.status;
    if (payload.actualMinutes !== undefined && payload.actualMinutes !== null) {
      task.actualMinutes = Number(payload.actualMinutes);
    }
    task.completedAt = task.status === 'DONE' ? task.completedAt || now() : null;
    saveState(state);
    return publicTask(state, task);
  },

  async deleteTask(id) {
    await delay();
    const { state, user } = requireUser();
    state.tasks = state.tasks.filter((task) => !(task.userId === user.id && task.id === Number(id)));
    saveState(state);
    return null;
  },

  async generateTasks(payload) {
    await delay();
    const { state, user } = requireUser();
    ensureUserSeed(state, user.id, { includeTasks: false });
    const subjects = state.subjects.filter((subject) => subject.userId === user.id);
    const date = payload.date || todayISO();
    const totalMinutes = Number(payload.totalMinutes || 360);
    const plannedMinutes = Math.max(30, Math.floor(totalMinutes / Math.max(subjects.length, 1)));
    const created = [];

    subjects.forEach((subject) => {
      const title = `${subject.name} 今日复习`;
      const exists = state.tasks.some((task) => (
        task.userId === user.id
        && task.subjectId === subject.id
        && task.taskDate === date
        && task.title === title
      ));
      if (exists) {
        return;
      }

      const task = {
        id: nextId(state, 'taskSeq'),
        userId: user.id,
        subjectId: subject.id,
        title,
        description: '按计划完成知识点复盘、真题练习和错题整理。',
        taskDate: date,
        status: 'TODO',
        priority: 'MEDIUM',
        plannedMinutes,
        actualMinutes: 0,
        completedAt: null,
        createdAt: now(),
      };
      state.tasks.push(task);
      created.push(publicTask(state, task));
    });

    saveState(state);
    return created;
  },

  async dashboardSummary(params = {}) {
    await delay();
    const { state, user } = requireUser();
    ensureUserSeed(state, user.id);
    saveState(state);

    const end = params.end || todayISO();
    const start = params.start || shiftDateISO(end, -6);
    const tasks = state.tasks
      .filter((task) => task.userId === user.id)
      .filter((task) => task.taskDate >= start && task.taskDate <= end);

    const completedTasks = tasks.filter((task) => task.status === 'DONE').length;
    const plannedMinutes = sum(tasks, 'plannedMinutes');
    const actualMinutes = sum(tasks, 'actualMinutes');
    const subjects = state.subjects
      .filter((subject) => subject.userId === user.id)
      .map((subject) => {
        const subjectTasks = tasks.filter((task) => task.subjectId === subject.id);
        return {
          subjectId: subject.id,
          subjectName: subject.name,
          color: subject.color,
          totalTasks: subjectTasks.length,
          completedTasks: subjectTasks.filter((task) => task.status === 'DONE').length,
          plannedMinutes: sum(subjectTasks, 'plannedMinutes'),
          actualMinutes: sum(subjectTasks, 'actualMinutes'),
        };
      })
      .filter((subject) => subject.totalTasks > 0 || subject.actualMinutes > 0);

    return {
      totalTasks: tasks.length,
      completedTasks,
      completionRate: tasks.length ? Math.round((completedTasks / tasks.length) * 10000) / 100 : 0,
      plannedMinutes,
      actualMinutes,
      subjects,
      days: dateRange(start, end).map((date) => {
        const dayTasks = tasks.filter((task) => task.taskDate === date);
        return {
          date,
          totalTasks: dayTasks.length,
          completedTasks: dayTasks.filter((task) => task.status === 'DONE').length,
          actualMinutes: sum(dayTasks, 'actualMinutes'),
        };
      }),
    };
  },

  async chat(payload) {
    await delay(500);
    requireUser();
    return {
      fallback: true,
      answer: `Mock 答复：关于“${payload.message}”，建议先把目标拆成今天必须完成、可以推进、需要复盘三类。每个任务控制在 30-60 分钟，完成后记录实际时长，并在晚上用错题或真题结果修正明天计划。`,
    };
  },
};

function loadState() {
  const raw = localStorage.getItem(STATE_KEY);
  if (!raw) {
    return initialState();
  }
  try {
    return JSON.parse(raw);
  } catch {
    return initialState();
  }
}

function saveState(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function initialState() {
  return {
    userSeq: 1,
    subjectSeq: 1,
    taskSeq: 1,
    users: [],
    subjects: [],
    tasks: [],
  };
}

function requireUser() {
  const state = loadState();
  const token = localStorage.getItem('kaoyan_buddy_token') || '';
  const userId = Number(token.startsWith(TOKEN_PREFIX) ? token.split('-')[2] : 0);
  const user = state.users.find((item) => item.id === userId);
  if (!user) {
    localStorage.removeItem('kaoyan_buddy_token');
    window.dispatchEvent(new Event('kaoyan-buddy-auth-expired'));
    throw apiError('登录已过期，请重新登录', 401);
  }
  return { state, user };
}

function ensureUserSeed(state, userId, options = { includeTasks: true }) {
  const hasSubjects = state.subjects.some((subject) => subject.userId === userId);
  if (!hasSubjects) {
    seedSubjects.forEach((subject) => {
      state.subjects.push({
        ...subject,
        id: nextId(state, 'subjectSeq'),
        userId,
        createdAt: now(),
      });
    });
  }

  if (options.includeTasks === false) {
    return;
  }

  const hasTasks = state.tasks.some((task) => task.userId === userId);
  if (hasTasks) {
    return;
  }

  const subjects = state.subjects.filter((subject) => subject.userId === userId);
  subjects.forEach((subject, subjectIndex) => {
    const titles = seedTaskTitles[subject.name] || [`${subject.name} 基础复盘`];
    titles.forEach((title, titleIndex) => {
      const done = subjectIndex + titleIndex < 3;
      state.tasks.push({
        id: nextId(state, 'taskSeq'),
        userId,
        subjectId: subject.id,
        title,
        description: done ? '完成后整理关键错因和可复用方法。' : '保持专注，结束后记录完成情况。',
        taskDate: shiftDateISO(todayISO(), titleIndex - subjectIndex),
        status: done ? 'DONE' : titleIndex === 0 ? 'IN_PROGRESS' : 'TODO',
        priority: subjectIndex % 2 === 0 ? 'HIGH' : 'MEDIUM',
        plannedMinutes: 60 + subjectIndex * 15,
        actualMinutes: done ? 55 + subjectIndex * 10 : 0,
        completedAt: done ? now() : null,
        createdAt: now(),
      });
    });
  });
}

function publicTask(state, task) {
  return {
    id: task.id,
    subject: publicSubject(findSubject(state, task.userId, task.subjectId)),
    title: task.title,
    description: task.description,
    taskDate: task.taskDate,
    status: task.status,
    priority: task.priority,
    plannedMinutes: task.plannedMinutes,
    actualMinutes: task.actualMinutes,
    completedAt: task.completedAt,
    createdAt: task.createdAt,
  };
}

function publicSubject(subject) {
  return {
    id: subject.id,
    name: subject.name,
    category: subject.category,
    color: subject.color,
    targetHours: subject.targetHours,
    createdAt: subject.createdAt,
  };
}

function findSubject(state, userId, subjectId) {
  const subject = state.subjects.find((item) => item.userId === userId && item.id === subjectId);
  if (!subject) {
    throw apiError('科目不存在', 404);
  }
  return subject;
}

function findTask(state, userId, taskId) {
  const task = state.tasks.find((item) => item.userId === userId && item.id === taskId);
  if (!task) {
    throw apiError('任务不存在', 404);
  }
  return task;
}

function tokenFor(userId) {
  return `${TOKEN_PREFIX}${userId}-${Date.now()}`;
}

function nextId(state, key) {
  const id = state[key];
  state[key] += 1;
  return id;
}

function apiError(message, status) {
  const error = new Error(message);
  error.status = status;
  error.fields = {};
  return error;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function delay(ms = 180) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function now() {
  return new Date().toISOString();
}

function todayISO() {
  return toLocalISO(new Date());
}

function shiftDateISO(dateISO, days) {
  const date = new Date(`${dateISO}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalISO(date);
}

function dateRange(start, end) {
  const dates = [];
  const cursor = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  while (cursor <= last) {
    dates.push(toLocalISO(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function toLocalISO(date) {
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function sum(items, key) {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0);
}
