// Kuchli parol talablari va tekshiruvi:
// 1. Kamida 8 ta belgi
// 2. Katta harf (A-Z)
// 3. Kichik harf (a-z)
// 4. Raqam (0-9)
// 5. Maxsus simvol / belgi (!@#$%^&* va h.k.)

export function checkPasswordCriteria(password) {
  const pwd = String(password || '');
  const hasMinLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`§±]/.test(pwd);

  const criteria = [
    { id: 'len', label: "Kamida 8 ta belgi", passed: hasMinLength },
    { id: 'upper', label: "Katta harf (A-Z)", passed: hasUpper },
    { id: 'lower', label: "Kichik harf (a-z)", passed: hasLower },
    { id: 'num', label: "Raqam (0-9)", passed: hasNumber },
    { id: 'spec', label: "Maxsus simvol (!@#$...)", passed: hasSpecial }
  ];

  const passedCount = criteria.filter(c => c.passed).length;
  const isValid = passedCount === 5;

  let strength = 'Juda zaif';
  let color = '#ef4444';
  if (passedCount <= 2) {
    strength = 'Juda zaif';
    color = '#ef4444';
  } else if (passedCount === 3) {
    strength = "O'rtacha";
    color = '#f59e0b';
  } else if (passedCount === 4) {
    strength = 'Yaxshi';
    color = '#3b82f6';
  } else if (passedCount === 5) {
    strength = 'Kuchli (Xavfsiz)';
    color = '#10b981';
  }

  return {
    criteria,
    passedCount,
    isValid,
    strength,
    color,
    percent: (passedCount / 5) * 100
  };
}

export function generateStrongPassword(length = 14) {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnpqrstuvwxyz';
  const numbers = '23456789';
  const specials = '!@#$%^&*_-+=?';

  const all = uppers + lowers + numbers + specials;

  // Har bir toifadan kamida bittadan kafolatlangan holda olish
  const result = [
    uppers[Math.floor(Math.random() * uppers.length)],
    lowers[Math.floor(Math.random() * lowers.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    specials[Math.floor(Math.random() * specials.length)]
  ];

  for (let i = 4; i < length; i++) {
    result.push(all[Math.floor(Math.random() * all.length)]);
  }

  return result.sort(() => 0.5 - Math.random()).join('');
}
