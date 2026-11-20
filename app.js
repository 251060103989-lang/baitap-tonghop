import { loadData } from './data-loader.js';
import { renderStudentList, sortVietnameseStudents } from './student-list.js';
import { setupStudentModal } from './student-modal.js';
import { calculateStudentResult, formatCurrency, formatScore } from './grade-calculator.js';

const $ = id => document.getElementById(id);
let students = [], subjects = [], grades = [], searchKeyword = '';
const STORAGE_KEY = 'student-grade-manager-v1';
const gradeFor = id => grades.find(g => g.student_id === id);
const resultFor = id => { const grade = gradeFor(id); return grade ? calculateStudentResult(grade, subjects) : null; };

function saveGrades() { localStorage.setItem(STORAGE_KEY, JSON.stringify(grades)); }
function refreshList() {
    const filtered = students.filter(s => `${s.id} ${s.name}`.toLocaleLowerCase('vi').includes(searchKeyword));
    renderStudentList(sortVietnameseStudents(filtered), subjects, grades);
    renderStats(); renderComparisonOptions();
}
function renderStats() {
    const results = students.map(s => ({ student: s, result: resultFor(s.id) })).filter(x => x.result);
    const levels = ['Giỏi','Khá','Trung bình','Yếu'];
    const counts = Object.fromEntries(levels.map(level => [level, results.filter(x => x.result.classification === level).length]));
    $('classificationChart').innerHTML = levels.map(level => `<div class="bar-row"><span>${level}</span><div class="bar-track"><div class="bar-fill level-${level.replaceAll(' ', '-')}" style="width:${results.length ? counts[level] / results.length * 100 : 0}%"></div></div><strong>${counts[level]}</strong></div>`).join('');
    const averages = results.map(x => x.result.average);
    $('highestAverage').textContent = averages.length ? Math.max(...averages).toFixed(2) : '0.00';
    $('lowestAverage').textContent = averages.length ? Math.min(...averages).toFixed(2) : '0.00';
    $('statsCount').textContent = results.length;
    $('subjectStats').innerHTML = subjects.map(subject => {
        const scores = results.map(x => x.result.subjectResults.find(r => r.subjectId === subject.id)?.average ?? 0);
        const avg = scores.length ? scores.reduce((a,b) => a+b,0)/scores.length : 0;
        return `<tr><td>${subject.name}</td><td>${avg.toFixed(2)}</td><td>${scores.length ? Math.min(...scores).toFixed(2) : '0.00'}</td><td>${scores.length ? Math.max(...scores).toFixed(2) : '0.00'}</td></tr>`;
    }).join('');
    $('underFive').innerHTML = results.filter(x => x.result.average < 5).map(x => `<li>${x.student.name} (${x.student.id}) – ${formatScore(x.result.average)}</li>`).join('') || '<li>Không có sinh viên nào.</li>';
}
function scholarshipAllocation() {
    const ranked = students.map(student => ({ student, result: resultFor(student.id) })).filter(x => x.result).sort((a,b) => b.result.average - a.result.average || a.student.id.localeCompare(b.student.id));
    const n = ranked.length;

const first = Math.ceil(n * 0.10);
const second = Math.ceil(n * 0.20);
const third = Math.ceil(n * 0.20);
    const groups = [
        { name:'Top 10%', count:first, pool:40000000 },
        { name:'Top 10%–40%', count:second, pool:40000000 },
        { name:'Top 40%–90%', count:third, pool:20000000 }
    ];
    let cursor = 0; const allocations = new Map();
    groups.forEach(group => {
        const members = ranked.slice(cursor, cursor + group.count); cursor += group.count;
        // Chia theo đơn vị 1.000 đồng; phân phối phần dư để tổng quỹ đúng 100 triệu.
        if (!members.length) return;
        const units = Math.floor(group.pool / 1000), base = Math.floor(units / members.length), remainder = units % members.length;
        members.forEach((member, index) => allocations.set(member.student.id, { amount:(base + (index < remainder ? 1 : 0))*1000, group:group.name }));
    });
    return { ranked, allocations };
}
function renderScholarships() {
    const { ranked, allocations } = scholarshipAllocation();
    $('scholarshipTable').innerHTML = ranked.map((x, i) => {
        const allocation = allocations.get(x.student.id);
        return `<tr><td>${i+1}</td><td>${x.student.id}</td><td>${x.student.name}</td><td>${formatScore(x.result.average)}</td><td>${allocation?.group || 'Không nhận'}</td><td>${formatCurrency(allocation?.amount || 0)}</td></tr>`;
    }).join('');
    $('scholarshipTotal').textContent = formatCurrency([...allocations.values()].reduce((sum,x)=>sum+x.amount,0));
}
function renderComparisonOptions() {
    const options = students.map(s => `<option value="${s.id}">${s.name} (${s.id})</option>`).join('');
    const previousA = $('compareA').value, previousB = $('compareB').value;
    $('compareA').innerHTML = options; $('compareB').innerHTML = options;
    $('compareA').value = students.some(s=>s.id===previousA) ? previousA : (students[0]?.id || '');
    $('compareB').value = students.some(s=>s.id===previousB) ? previousB : (students[1]?.id || students[0]?.id || '');
}
function renderComparison() {
    const a = resultFor($('compareA').value), b = resultFor($('compareB').value);
    if (!a || !b) { $('comparisonBody').innerHTML = '<tr><td colspan="3">Chưa đủ dữ liệu để so sánh.</td></tr>'; return; }
    $('comparisonBody').innerHTML = subjects.map((s,i)=>`<tr><td>${s.name}</td><td>${formatScore(a.subjectResults[i].average)}</td><td>${formatScore(b.subjectResults[i].average)}</td></tr>`).join('') + `<tr class="comparison-total"><td>Điểm trung bình học kỳ</td><td>${formatScore(a.average)} (${a.classification})</td><td>${formatScore(b.average)} (${b.classification})</td></tr>`;
}
function setupTabs() {
    document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
        document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active', b===button));
        document.querySelectorAll('.tab-panel').forEach(panel=>panel.hidden = panel.id !== button.dataset.tab);
        if (button.dataset.tab === 'scholarshipPanel') renderScholarships();
        if (button.dataset.tab === 'comparePanel') renderComparison();
    }));
}
async function init() {
    try {
        ({ students, subjects, grades } = await loadData());
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) { try { const overrides = JSON.parse(saved); grades = grades.map(g => overrides.find(x=>x.student_id===g.student_id) || g); } catch { localStorage.removeItem(STORAGE_KEY); } }
        setupStudentModal(students, subjects, grades, updated => {
            const index = grades.findIndex(g=>g.student_id===updated.student_id);
            if (index >= 0) grades[index] = updated; else grades.push(updated);
            saveGrades(); refreshList(); renderScholarships();
        });
        $('searchInput').addEventListener('input', e => { searchKeyword = e.target.value.trim().toLocaleLowerCase('vi'); refreshList(); });
        $('compareA').addEventListener('change', renderComparison); $('compareB').addEventListener('change', renderComparison);
        setupTabs(); refreshList(); renderScholarships(); $('loadingMessage').hidden = true;
    } catch (error) { $('loadingMessage').hidden = true; $('errorMessage').hidden = false; $('errorMessage').textContent = error.message; console.error(error); }
}
init();
