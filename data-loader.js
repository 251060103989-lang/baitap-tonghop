// Đọc JSON theo đường dẫn tương đối để chạy được cả GitHub Pages và localhost.
export async function loadData() {
    const base = new URL('../data/', import.meta.url);
    const files = ['students.json', 'subjects.json', 'grades.json'];
    const responses = await Promise.all(files.map(file => fetch(new URL(file, base))));
    const failed = responses.find(response => !response.ok);
    if (failed) throw new Error(`Không tải được dữ liệu mẫu (HTTP ${failed.status}). Hãy chạy website bằng Live Server hoặc GitHub Pages, không mở trực tiếp file index.html.`);
    const [students, subjects, grades] = await Promise.all(responses.map(response => response.json()));
    if (!Array.isArray(students) || !Array.isArray(subjects) || !Array.isArray(grades)) throw new Error('Dữ liệu JSON không đúng định dạng.');
    return { students, subjects, grades };
}
