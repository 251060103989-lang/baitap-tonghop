
// Đọc dữ liệu JSON từ thư mục gốc GitHub
export async function loadData() {
    const base = new URL('./', import.meta.url);

    const files = [
        'students.json',
        'subjects.json',
        'grades.json'
    ];

    const responses = await Promise.all(
        files.map(file => fetch(new URL(file, base)))
    );

    const failed = responses.find(response => !response.ok);

    if (failed) {
        throw new Error(
            `Không tải được dữ liệu JSON (HTTP ${failed.status}).`
        );
    }

    const [students, subjects, grades] = await Promise.all(
        responses.map(response => response.json())
    );

    if (
        !Array.isArray(students) ||
        !Array.isArray(subjects) ||
        !Array.isArray(grades)
    ) {
        throw new Error('Dữ liệu JSON không đúng định dạng.');
    }

    return {
        students,
        subjects,
        grades
    };
}
