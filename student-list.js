import { calculateStudentResult, formatCurrency, formatScore } from './grade-calculator.js';

export function sortVietnameseStudents(students) {
    const collator = new Intl.Collator('vi', { sensitivity: 'base' });
    return [...students].sort((a, b) => {
        const aParts = a.name.trim().split(/\s+/), bParts = b.name.trim().split(/\s+/);
        const givenName = collator.compare(aParts.at(-1) || '', bParts.at(-1) || '');
        if (givenName) return givenName;
        const aFamilyMiddle = aParts.slice(0, -1).join(' '), bFamilyMiddle = bParts.slice(0, -1).join(' ');
        return collator.compare(aFamilyMiddle, bFamilyMiddle) || collator.compare(a.id, b.id);
    });
}

export function renderStudentList(students, subjects, grades) {
    const head = document.getElementById('tableHead'), body = document.getElementById('studentTableBody');
    const gradeMap = new Map(grades.map(grade => [grade.student_id, grade]));
    head.innerHTML = `<tr><th>Mã SV</th><th>Họ và tên</th>${subjects.map(s => `<th>${s.name}</th>`).join('')}<th>Điểm TB HK</th><th>Xếp loại</th><th>Học bổng</th><th>Chi tiết</th></tr>`;
    body.innerHTML = students.map(student => {
        const grade = gradeMap.get(student.id);
        if (!grade) return `<tr><td>${student.id}</td><td class="student-name">${student.name}</td><td colspan="${subjects.length + 5}">Chưa có dữ liệu điểm</td></tr>`;
        const result = calculateStudentResult(grade, subjects);
        return `<tr><td>${student.id}</td><td class="student-name">${student.name}</td>${result.subjectResults.map(item => `<td>${formatScore(item.average)}</td>`).join('')}<td class="average-score">${formatScore(result.average)}</td><td><span class="classification class-${result.classification.replaceAll(' ', '-')}">${result.classification}</span></td><td>${formatCurrency(result.scholarship)}</td><td><button class="detail-button" data-student-id="${student.id}">Xem</button></td></tr>`;
    }).join('');
    const results = students.map(s => gradeMap.has(s.id) ? calculateStudentResult(gradeMap.get(s.id), subjects) : null).filter(Boolean);
    document.getElementById('totalStudents').textContent = students.length;
    document.getElementById('classAverage').textContent = results.length ? (results.reduce((sum, r) => sum + r.average, 0) / results.length).toFixed(2) : '0.00';
    document.getElementById('scholarshipCount').textContent = results.filter(r => r.scholarship > 0).length;
    document.getElementById('resultCount').textContent = `Hiển thị ${students.length} / ${gradeMap.size} sinh viên có dữ liệu điểm`;
}
