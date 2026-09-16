import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `Bạn là Gia sư Lập trình Python (AI Tutor) tiếng Việt của nền tảng PYTHON-MASTER (xây dựng và phát triển bởi MaiTamDev).

Mục tiêu cao nhất của bạn là giúp học viên hiểu sâu bản chất tư duy lập trình và tự tay viết được mã nguồn.

QUY TẮC SƯ PHẠM VÀ CHẨN ĐOÁN LỖI:
1. Khi học viên gặp lỗi chạy code (SyntaxError, TypeError, IndexError...) hoặc nộp bài bị Fail Test Case:
   - Bước 1: Xác định chính xác loại lỗi.
   - Bước 2: Chỉ ra dòng mã hoặc khu vực khả nghi trong code của học viên.
   - Bước 3: Giải thích nguyên nhân phát sinh lỗi bằng ngôn ngữ sư phạm dễ hiểu.
   - Bước 4: Cho 1 gợi ý cụ thể để học viên tự tư duy sửa lỗi.
   - Bước 5: Nếu cần, chỉ đưa ra đoạn code snippet nhỏ (1-2 dòng) minh họa cú pháp.
   - Bước 6: TUYỆT ĐỐI KHÔNG viết lại toàn bộ lời giải hoàn chỉnh trừ khi học viên yêu cầu trực tiếp.
2. Phương pháp giải thích:
   - Đi từ trực giác đời thường (intuition) → ví dụ minh họa trực quan → gợi ý sửa code.
3. Luôn giữ thái độ kiên nhẫn, khuyến khích, truyền cảm hứng và chuyên nghiệp.
4. Trả lời bằng tiếng Việt chuẩn mực, giữ nguyên các từ khóa lập trình Python bằng tiếng Anh (ví dụ: while, for, if, def, list, return, print, index).`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Graceful fallback if no API key is configured
    if (!apiKey) {
      return NextResponse.json({
        reply: `Chào bạn! Tôi là Gia sư AI của PYTHON-MASTER 🐍\n\nBạn đang tìm hiểu bài học "${context?.lessonTitle || 'Lập trình Python'}".\n\n(Lưu ý: Để kích hoạt trí tuệ nhân tạo Gemini trực tiếp, bạn vui lòng cấu hình biến môi trường \`GEMINI_API_KEY\` trong file \`.env.local\`).\n\n💡 **Gợi ý nhanh**: Hãy kiểm tra kỹ thông báo lỗi, đối chiếu dữ liệu đầu vào (stdin) và từng dòng lệnh trong chương trình trước nhé!`,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build comprehensive context prompt
    let contextHeader = '';
    if (context) {
      contextHeader = `[BỐI CẢNH BÀI HỌC HIỆN TẠI]
Khóa học: ${context.courseTitle || 'PYTHON-MASTER'}
Phần học: ${context.partTitle || ''}
Bài học: ${context.lessonTitle || ''}
Mục đang đọc: ${context.currentSection || ''}
`;

      if (context.currentExercise) {
        const ex = context.currentExercise;
        contextHeader += `\n[BÀI TẬP ĐANG LÀM]
Tên bài: ${ex.title || ''}
Đề bài: ${ex.description || ''}
${ex.studentCode ? `Mã nguồn học viên đang viết:\n\`\`\`python\n${ex.studentCode}\n\`\`\`\n` : ''}
${ex.stdin ? `Dữ liệu đầu vào mô phỏng (stdin): ${ex.stdin}\n` : ''}
${ex.currentOutput ? `Đầu ra thực tế (Output / Stderr):\n${ex.currentOutput}\n` : ''}
${ex.failedTestDetails ? `Chi tiết Test Cases chưa đạt:\n${ex.failedTestDetails}\n` : ''}
${ex.gradingFeedback ? `Tổng kết chấm điểm: ${ex.gradingFeedback}\n` : ''}`;
      }

      contextHeader += `----------------------------------------\n\n`;
    }

    // Format chat contents
    const contents = messages.map((m: { role: string; content: string }, index: number) => {
      let text = m.content;
      if (index === messages.length - 1) {
        text = contextHeader + text;
      }
      return {
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text }],
      };
    });

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Xin lỗi, tôi chưa thể trả lời lúc này.';

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error('AI Tutor API error:', error);
    const errMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Lỗi khi kết nối với AI Tutor: ' + errMessage },
      { status: 500 }
    );
  }
}
