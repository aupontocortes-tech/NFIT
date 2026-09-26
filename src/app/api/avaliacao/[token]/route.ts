import { bodyMetrics, type BodyInput } from "@/lib/body-metrics";
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

  const details: BodyInput = {
    sex: body.sex === "m" ? "m" : "f",
    age: Number(body.age),
    heightCm: Number(body.heightCm),
    weightKg: Number(body.weightKg),
    chestCm: Number(body.chestCm),
    bicepsRightCm: Number(body.bicepsRightCm),
    bicepsLeftCm: Number(body.bicepsLeftCm),
    bicepsCm: (Number(body.bicepsRightCm) + Number(body.bicepsLeftCm)) / 2,
    forearmRightCm: Number(body.forearmRightCm),
    forearmLeftCm: Number(body.forearmLeftCm),
    forearmCm: (Number(body.forearmRightCm) + Number(body.forearmLeftCm)) / 2,
    waistCm: Number(body.waistCm),
    abdomenCm: Number(body.abdomenCm),
    hipCm: Number(body.hipCm),
    thighRightCm: Number(body.thighRightCm),
    thighLeftCm: Number(body.thighLeftCm),
    thighCm: (Number(body.thighRightCm) + Number(body.thighLeftCm)) / 2,
  };
  const photos = Array.isArray(body.photoUrls) ? body.photoUrls.filter((u) => typeof u === "string") : [];
  const invalid = Object.values(details).some((v) => typeof v === "number" && !Number.isFinite(v));
  if (invalid || details.age < 10 || details.age > 100 || details.heightCm < 120 || details.heightCm > 230) {
    return Response.json({ error: { message: "Informe idade, altura e as medidas." } }, { status: 400 });
  }
  if (details.weightKg < 30 || details.weightKg > 300) {
    return Response.json({ error: { message: "Informe o peso em kg." } }, { status: 400 });
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
