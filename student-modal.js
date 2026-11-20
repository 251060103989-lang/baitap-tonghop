import { calculateStudentResult, formatCurrency, formatScore } from './grade-calculator.js';

export function setupStudentModal(students, subjects, grades, onSave) {
    const modal = document.getElementById('studentModal'), detail = document.getElementById('studentDetail');
    const close = () => { modal.hidden = true; };
    document.getElementById('studentTableBody').addEventListener('click', event => {
        const button = event.target.closest('[data-student-id]');
        if (!button) return;
        const student = students.find(item => item.id === button.dataset.studentId);
        const grade = grades.find(item => item.student_id === button.dataset.studentId);
        if (!student || !grade) return;
        const result = calculateStudentResult(grade, subjects);
        detail.innerHTML = `<div class="student-info"><p><strong>Mã sinh viên:</strong> ${student.id}</p><p><strong>Họ và tên:</strong> ${student.name}</p><p><strong>Lớp:</strong> ${student.class}</p><p><strong>Email:</strong> ${student.email}</p></div><h3>Chi tiết điểm các môn</h3><div class="table-wrapper"><table class="detail-table"><thead><tr><th>Môn học</th><th>Chuyên cần</th><th>Giữa kỳ</th><th>Cuối kỳ</th><th>Điểm TB</th></tr></thead><tbody>${result.subjectResults.map(item => `<tr><td>${item.subjectName}</td>${item.scores.map(score => `<td>${Number(score).toFixed(1)}</td>`).join('')}<td>${formatScore(item.average)}</td></tr>`).join('')}</tbody></table></div><div class="result-summary"><p><strong>Điểm trung bình học kỳ:</strong> ${formatScore(result.average)}</p><p><strong>Xếp loại:</strong> ${result.classification}</p><p><strong>Học bổng:</strong> ${formatCurrency(result.scholarship)}</p></div><h3>Cập nhật điểm thành phần</h3><form id="editScoresForm"><div class="edit-score-grid">${subjects.map(subject => { const scores = grade.scores[subject.id] || [0,0,0]; return `<fieldset><legend>${subject.name}</legend>${['Chuyên cần','Giữa kỳ','Cuối kỳ'].map((label, i) => `<label>${label}<input type="number" min="0" max="10" step="0.1" required name="${subject.id}-${i}" value="${scores[i]}"></label>`).join('')}</fieldset>`; }).join('')}</div><button class="primary-button" type="submit">Lưu điểm và tính lại</button></form>`;
        detail.querySelector('#editScoresForm').addEventListener('submit', e => {
            e.preventDefault(); const form = new FormData(e.currentTarget);
            const updated = structuredClone(grade);
            for (const subject of subjects) updated.scores[subject.id] = [0,1,2].map(i => Number(form.get(`${subject.id}-${i}`)));
            if (Object.values(updated.scores).some(scores => scores.some(score => !Number.isFinite(score) || score < 0 || score > 10))) return alert('Điểm phải nằm trong khoảng 0 đến 10.');
            onSave(updated); close();
        });
        modal.hidden = false;
    });
    document.getElementById('closeModal').addEventListener('click', close);
    modal.addEventListener('click', event => { if (event.target.hasAttribute('data-close-modal')) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) close(); });
}
