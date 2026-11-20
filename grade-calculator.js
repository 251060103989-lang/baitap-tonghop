// Công thức đúng theo đề: 10% chuyên cần, 40% giữa kỳ, 50% cuối kỳ.
export const WEIGHTS = { attendance: 0.1, midterm: 0.4, final: 0.5 };

export function calculateSubjectAverage(scores = []) {
    const [attendance = 0, midterm = 0, final = 0] = scores;
    return attendance * WEIGHTS.attendance + midterm * WEIGHTS.midterm + final * WEIGHTS.final;
}

export function classify(average) {
    if (average >= 8.5) return 'Giỏi';
    if (average >= 7) return 'Khá';
    if (average >= 5) return 'Trung bình';
    return 'Yếu';
}

export function calculateStudentResult(grade, subjects) {
    const subjectResults = subjects.map(subject => {
        const scores = grade?.scores?.[subject.id] || [0, 0, 0];
        const average = calculateSubjectAverage(scores);
        return { subjectId: subject.id, subjectName: subject.name, scores, average };
    });
    const average = subjectResults.length
        ? subjectResults.reduce((sum, item) => sum + item.average, 0) / subjectResults.length : 0;
    let scholarship = 0;
    if (average >= 8.5) scholarship = 1500000;
    else if (average >= 8) scholarship = 1000000;
    return { subjectResults, average, classification: classify(average), scholarship };
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}
export function formatScore(score) { return Number(score).toFixed(2); }
