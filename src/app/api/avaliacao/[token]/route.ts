import { bodyMetrics, type BodyInput } from "@/lib/body-metrics";
import { heightToCm, parseBrNumber } from "@/lib/br-number";
import { getStudent } from "@/lib/server/students";
import { saveCheckin, studentIdByToken } from "@/lib/server/checkins";

type Ctx = { params: Promise<{ token: string }> };

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "aluno";
}

export async function GET(_request: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  try {
    const studentId = await studentIdByToken(token);
    if (!studentId) {
      return Response.json({ error: { message: "Link inválido" } }, { status: 404 });
    }
    const student = await getStudent(studentId);
    if (!student) {
      return Response.json({ error: { message: "Aluno não encontrado" } }, { status: 404 });
    }
    return Response.json({ name: firstName(student.name), avatarUrl: student.avatarUrl ?? null });
  } catch (e) {
    console.error("[avaliacao]", e);
    return Response.json({ error: { message: "Não foi possível abrir o link." } }, { status: 503 });
  }
}

export async function POST(request: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  let body: Partial<BodyInput> & { notes?: string; photoUrls?: string[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }

  const age = parseBrNumber(body.age);
  const heightCm = heightToCm(body.heightCm);
  const weightKg = parseBrNumber(body.weightKg);
  const chestCm = parseBrNumber(body.chestCm);
  const bicepsRightCm = parseBrNumber(body.bicepsRightCm);
  const bicepsLeftCm = parseBrNumber(body.bicepsLeftCm);
  const forearmRightCm = parseBrNumber(body.forearmRightCm);
  const forearmLeftCm = parseBrNumber(body.forearmLeftCm);
  const waistCm = parseBrNumber(body.waistCm);
  const abdomenCm = parseBrNumber(body.abdomenCm);
  const hipCm = parseBrNumber(body.hipCm);
  const thighRightCm = parseBrNumber(body.thighRightCm);
  const thighLeftCm = parseBrNumber(body.thighLeftCm);
  const details: BodyInput = {
    sex: body.sex === "m" ? "m" : "f",
    age,
    heightCm,
    weightKg,
    chestCm,
    bicepsRightCm,
    bicepsLeftCm,
    bicepsCm: (bicepsRightCm + bicepsLeftCm) / 2,
    forearmRightCm,
    forearmLeftCm,
    forearmCm: (forearmRightCm + forearmLeftCm) / 2,
    waistCm,
    abdomenCm,
    hipCm,
    thighRightCm,
    thighLeftCm,
    thighCm: (thighRightCm + thighLeftCm) / 2,
  };
  const photos = Array.isArray(body.photoUrls) ? body.photoUrls.filter((u) => typeof u === "string") : [];
  if (!Number.isFinite(age) || age < 5 || age > 100) {
    return Response.json({ error: { message: "Informe a idade. Pode usar vírgula, como 27 ou 27,5." } }, { status: 400 });
  }
  if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 230) {
    return Response.json({ error: { message: "Informe a altura. Use 170 ou 1,70." } }, { status: 400 });
  }
  if (!Number.isFinite(weightKg) || weightKg < 20 || weightKg > 300) {
    return Response.json({ error: { message: "Informe o peso em quilos, com vírgula se precisar, como 62,5." } }, { status: 400 });
  }
  const measures = [chestCm, bicepsRightCm, bicepsLeftCm, forearmRightCm, forearmLeftCm, waistCm, abdomenCm, hipCm, thighRightCm, thighLeftCm];
  if (measures.some((n) => !Number.isFinite(n) || n <= 0)) {
    return Response.json({ error: { message: "Preencha as medidas. Pode usar vírgula, como 30,5." } }, { status: 400 });
  }
  if (photos.length < 1) {
    return Response.json({ error: { message: "Envie pelo menos uma foto." } }, { status: 400 });
  }

  try {
    const studentId = await studentIdByToken(token);
    if (!studentId) {
      return Response.json({ error: { message: "Link inválido" } }, { status: 404 });
    }
    const id = await saveCheckin({
      studentId,
      weightKg: details.weightKg,
      waistCm: details.waistCm,
      hipCm: details.hipCm,
      notes: body.notes?.trim(),
      photoUrls: photos.slice(0, 4),
      details,
    });
    return Response.json({ id, result: bodyMetrics(details) }, { status: 201 });
  } catch (e) {
    console.error("[avaliacao]", e);
    return Response.json({ error: { message: "Não foi possível enviar." } }, { status: 503 });
  }
}
