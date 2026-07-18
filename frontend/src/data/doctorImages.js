const doctorImages = {
  dr_smith: "/assets/img/health/staff-1.webp",
  dr_johnson: "/assets/img/health/staff-2.webp",
  dr_patel: "/assets/img/health/staff-3.webp",
  dr_chen: "/assets/img/health/staff-4.webp",
  dr_garcia: "/assets/img/health/staff-5.webp",
  dr_williams: "/assets/img/health/staff-6.webp",
  dr_kim: "/assets/img/health/staff-7.webp",
  dr_ahmed: "/assets/img/health/staff-8.webp",
  dr_lee: "/assets/img/health/staff-10.webp",
  dr_martinez: "/assets/img/health/staff-11.webp",
};

const fallbackImages = [
  "/assets/img/health/staff-14.webp",
  "/assets/img/health/staff-1.webp",
  "/assets/img/health/staff-2.webp",
];

export function getDoctorImage(doctor) {
  if (doctor?.image) return doctor.image;
  if (doctor?.username && doctorImages[doctor.username]) return doctorImages[doctor.username];
  if (doctor?.id) return fallbackImages[doctor.id % fallbackImages.length];
  return fallbackImages[0];
}

export function getDoctorImageById(id) {
  const keys = Object.keys(doctorImages);
  if (id && keys[id - 1]) return doctorImages[keys[id - 1]];
  return fallbackImages[(id || 0) % fallbackImages.length];
}

export default doctorImages;
