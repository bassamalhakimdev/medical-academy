import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRawSqlite } from "@/lib/db";
import { getZodErrorMessage } from "@/lib/utils";
import { z } from "zod";

const updateScheduleSchema = z.object({
  title: z.string().min(3).optional(),
  startTime: z.number().int().min(1).optional(),
  endTime: z.number().int().min(1).optional(),
  durationMinutes: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const result = updateScheduleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(result.error) },
        { status: 400 }
      );
    }

    const data = result.data;
    const sqlite = getRawSqlite();

    const existing = await sqlite.prepare("SELECT id FROM exam_schedules WHERE id = ?").get(id);
    if (!existing) {
      return NextResponse.json({ error: "الجدولة غير موجودة" }, { status: 404 });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      values.push(data.title.trim());
    }
    if (data.startTime !== undefined) {
      updates.push("start_time = ?");
      values.push(data.startTime);
    }
    if (data.endTime !== undefined) {
      updates.push("end_time = ?");
      values.push(data.endTime);
    }
    if (data.durationMinutes !== undefined) {
      updates.push("duration_minutes = ?");
      values.push(data.durationMinutes);
    }
    if (data.isActive !== undefined) {
      updates.push("is_active = ?");
      values.push(data.isActive ? 1 : 0);
    }

    if (updates.length > 0) {
      values.push(id);
      await sqlite.prepare(`UPDATE exam_schedules SET ${updates.join(", ")} WHERE id = ?`).run(...values);

      // If times or duration were updated, also update related uncompleted assignments
      if (data.startTime !== undefined || data.endTime !== undefined || data.durationMinutes !== undefined) {
        const assignUpdates: string[] = [];
        const assignValues: any[] = [];
        if (data.startTime !== undefined) {
          assignUpdates.push("assigned_start_time = ?");
          assignValues.push(data.startTime);
        }
        if (data.endTime !== undefined) {
          assignUpdates.push("assigned_end_time = ?");
          assignValues.push(data.endTime);
        }
        if (data.durationMinutes !== undefined) {
          assignUpdates.push("duration_minutes = ?");
          assignValues.push(data.durationMinutes);
        }
        assignValues.push(id);
        await sqlite
          .prepare(`UPDATE exam_assignments SET ${assignUpdates.join(", ")} WHERE schedule_id = ? AND status = 'assigned'`)
          .run(...assignValues);
      }
    }

    return NextResponse.json({ success: true, message: "تم تحديث الجدولة بنجاح" });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    return NextResponse.json({ error: "فشل تحديث الجدولة" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const sqlite = getRawSqlite();

    await sqlite.prepare("DELETE FROM exam_schedules WHERE id = ?").run(id);

    return NextResponse.json({ success: true, message: "تم حذف الجدولة بنجاح" });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    return NextResponse.json({ error: "فشل حذف الجدولة" }, { status: 500 });
  }
}
