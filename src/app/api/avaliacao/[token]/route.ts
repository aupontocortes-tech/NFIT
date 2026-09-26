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
    return Response.json({ name: firstName(student.name) });
  } catch (e) {
    console.error("[avaliacao]", e);
    return Response.json({ error: { message: "Não foi possível abrir o link." } }, { status: 503 });
  }
}

export async function POST(request: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  let body: {
    weightKg?: number;
    waistCm?: number;
    hipCm?: number;
    notes?: string;
    photoUrls?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }

  const weight = Number(body.weightKg);
  const photos = Array.isArray(body.photoUrls) ? body.photoUrls.filter((u) => typeof u === "string") : [];
  if (!Number.isFinite(weight) || weight < 30 || weight > 300) {
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
      weightKg: weight,
      waistCm: body.waistCm ? Number(body.waistCm) : undefined,
      hipCm: body.hipCm ? Number(body.hipCm) : undefined,
      notes: body.notes?.trim(),
      photoUrls: photos.slice(0, 4),
    });
    return Response.json({ id }, { status: 201 });
  } catch (e) {
    console.error("[avaliacao]", e);
    return Response.json({ error: { message: "Não foi possível enviar." } }, { status: 503 });
  }
}
