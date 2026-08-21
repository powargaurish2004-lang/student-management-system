const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const normalizeStudent = (student) => ({
    ...student,
    id: student.id || student._id,
    displayId: student.displayId || student.studentId
});

export const getToken = () => sessionStorage.getItem("sms_token");

export const saveSession = ({ token, user }) => {
    sessionStorage.setItem("sms_token", token);
    sessionStorage.setItem("sms_user", JSON.stringify(user));
};

export const clearSession = () => {
    sessionStorage.removeItem("sms_token");
    sessionStorage.removeItem("sms_user");
};

export const getUser = () => {
    try {
        return JSON.parse(sessionStorage.getItem("sms_user"));
    } catch {
        return null;
    }
};

export async function api(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(getToken()
                ? { Authorization: `Bearer ${getToken()}` }
                : {}),
            ...options.headers
        }
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Request failed.");
    }

    return response.status === 204
        ? null
        : response.json();
}


// AUTH API
export const authApi = {
    register: (data) =>
        api("/auth/register", {
            method: "POST",
            body: JSON.stringify(data)
        }),

    login: (data) =>
        api("/auth/login", {
            method: "POST",
            body: JSON.stringify(data)
        })
};


// STUDENT API
export const studentsApi = {
    list: async () => {
    const response = await api("/students");
    const students = Array.isArray(response)
        ? response
        : response.students || [];

    return students.map(student => ({
        ...normalizeStudent(student)
    }));
},

    create: async (data) => {
        const response = await api("/students", {
            method: "POST",
            body: JSON.stringify(data)
        });

        return normalizeStudent(response.student || response);
    },

    update: async (id, data) => {
        const response = await api(`/students/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        });

        return normalizeStudent(response.student || response);
    },

    toggle: async (id) => {
        const response = await api(`/students/${id}/status`, {
            method: "PATCH"
        });

        return normalizeStudent(response.student || response);
    },

    remove: (id) =>
        api(`/students/${id}`, {
            method: "DELETE"
        })
};