import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:4000";
const PASSWORD = "Str0ngPass!";

const authLatency = new Trend("auth_latency", true);
const taskLatency = new Trend("task_latency", true);
const publicLatency = new Trend("public_latency", true);
const errorRate = new Rate("http_errors");

export const options = {
  stages: [
    { duration: "10s", target: 5 },
    { duration: "40s", target: 15 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<800"],
    http_errors: ["rate<0.05"],
  },
};

function jsonHeaders(token) {
  return {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}

function uniqueUserId() {
  return `${Date.now()}-${__VU}-${__ITER}`;
}

function registerOrLogin(email, name) {
  const payload = JSON.stringify({
    name,
    email,
    password: PASSWORD,
    role: "user",
  });

  const res = http.post(`${BASE_URL}/api/auth/register`, payload, jsonHeaders());
  authLatency.add(res.timings.duration);

  if (res.status === 201) {
    return res.json("token");
  }

  if (res.status === 409) {
    const loginRes = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({ email, password: PASSWORD }),
      jsonHeaders(),
    );
    authLatency.add(loginRes.timings.duration);
    check(loginRes, {
      "login succeeded": (r) => r.status === 200 && r.json("token"),
    });
    return loginRes.json("token");
  }

  errorRate.add(1);
  check(res, {
    "register succeeded": (r) => r.status === 201,
  });
  return null;
}

function ensureIdentification(token, id) {
  const payload = JSON.stringify({ identification: `LOADTEST-${id}` });
  const res = http.patch(
    `${BASE_URL}/api/users/me`,
    payload,
    jsonHeaders(token),
  );
  check(res, {
    "identification updated": (r) => r.status === 200,
  }) || errorRate.add(1);
}

export default function () {
  const id = uniqueUserId();
  const email = `loadtest+${id}@example.com`;
  const name = `Load Tester ${id}`;

  group("auth", () => {
    const token = registerOrLogin(email, name);
    if (!token) {
      return;
    }

    ensureIdentification(token, id);

    group("create task", () => {
      const taskBody = JSON.stringify({
        title: `Sample task ${id}`,
        description: "Task created during k6 load testing",
        category: "Other",
        price: 50,
        location: { address: "Test City" },
      });

      const createRes = http.post(
        `${BASE_URL}/api/tasks`,
        taskBody,
        jsonHeaders(token),
      );

      taskLatency.add(createRes.timings.duration);

      check(createRes, {
        "task created": (r) => r.status === 201 || r.status === 400,
      }) || errorRate.add(1);
    });
  });

  group("public browse", () => {
    const res = http.get(`${BASE_URL}/api/tasks?search=Sample`);
    publicLatency.add(res.timings.duration);
    check(res, {
      "list tasks": (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  group("health", () => {
    const res = http.get(`${BASE_URL}/api/health`);
    publicLatency.add(res.timings.duration);
    check(res, {
      "health ok": (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  sleep(1);
}
