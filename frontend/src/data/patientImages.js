const patientImages = [
  "/assets/img/person/person-m-3.webp",
  "/assets/img/person/person-m-7.webp",
  "/assets/img/person/person-m-9.webp",
  "/assets/img/person/person-m-12.webp",
  "/assets/img/person/person-m-13.webp",
  "/assets/img/person/person-f-5.webp",
  "/assets/img/person/person-f-9.webp",
  "/assets/img/person/person-f-11.webp",
  "/assets/img/person/person-f-12.webp",
  "/assets/img/person/person-f-13.webp",
];

export function getPatientImage(patient) {
  if (patient?.image) return patient.image;
  const id = patient?.id || patient?.username?.charCodeAt(0) || 0;
  return patientImages[id % patientImages.length];
}

export default patientImages;
