# VietWireless Terminology Guide

File này là source of truth cho cách dùng tiếng Việt và thuật ngữ kỹ thuật.

## 1. Nguyên tắc

Ưu tiên tiếng Việt khi từ đó tự nhiên, rõ và không làm mất nghĩa kỹ thuật. Giữ tiếng Anh khi đó là:
- tên chuẩn trong 3GPP;
- acronym;
- tên channel/signal/procedure;
- thuật ngữ mà kỹ sư thực tế thường dùng và bản dịch gây gượng hoặc mơ hồ.

Mục tiêu là đọc tự nhiên bằng tiếng Việt nhưng vẫn nhận ra ngay thuật ngữ ngành.

## 2. Ưu tiên tiếng Việt trong prose và heading

| Tránh dùng thường xuyên | Ưu tiên |
| --- | --- |
| signal | tín hiệu |
| time | thời gian |
| frequency | tần số |
| time domain | miền thời gian |
| frequency domain | miền tần số |
| data | dữ liệu |
| network | mạng |
| information | thông tin |
| system information | thông tin hệ thống |
| wireless link | liên kết vô tuyến |
| connected mode | trạng thái đã kết nối / khi đã kết nối |

Có thể giữ từ tiếng Anh khi nó là một label kỹ thuật ngắn trong diagram hoặc khi cần nối trực tiếp với code/spec.

## 3. Giữ thuật ngữ chuẩn khi cần

Có thể giữ:
- sample, sampling;
- waveform;
- spectrum;
- subcarrier;
- resource grid;
- resource element;
- resource block;
- channel;
- equalization;
- synchronization;
- timing;
- Timing Advance;
- channel estimation;
- beamforming.

Lần đầu ở một bài mới nên giải thích ngắn bằng tiếng Việt thay vì dịch cứng.

## 4. 3GPP names không tự dịch

Giữ nguyên:
- PSS, SSS, SSB;
- PBCH, PBCH DM-RS;
- MIB, SIB1, SIB19;
- PDCCH, PDSCH, PUSCH, PUCCH, PRACH;
- CORESET#0, SearchSpace#0;
- DCI, RRC Setup;
- HARQ, MCS, MIMO.

Nếu cần, lần đầu ghi tên đầy đủ trong ngoặc.

## 5. Từ dễ gây sai mental model

### complex modulation symbol
Ưu tiên: symbol điều chế phức hoặc sau lần đầu là symbol phức.
Không gọi đơn giản là “tín hiệu phức” nếu đang nói một symbol rời rạc trên constellation/resource grid.

### I/Q
Trong prose, lần đầu có thể viết: “hai thành phần trực giao I và Q”. Mathematical notation phải theo MATH_STYLE_GUIDE.md.

### synchronization
Phải nói rõ đang là:
- downlink timing/frequency synchronization;
- frame/cell synchronization;
- hay uplink timing alignment.

Không dùng “đồng bộ” chung chung nếu ngữ cảnh có thể gây nhầm.

### channel
Phân biệt:
- physical wireless channel;
- channel response;
- physical channel trong 3GPP như PDSCH/PUSCH.

### resource
Nếu là resource vật lý trên grid, nói rõ resource element, resource block, symbol hoặc subcarrier; không dùng “tài nguyên” chung chung khi điều đó che mất cấu trúc.

## 6. Tính nhất quán

Một khái niệm đã chọn cách gọi trong một bài thì giữ nguyên trong toàn bài và các bài liên quan. Nếu đổi thuật ngữ toàn site, cập nhật file này trước rồi sửa đồng bộ.

## 7. Headings

Heading nên ưu tiên tiếng Việt:
- “Từ tín hiệu tới liên kết vô tuyến”
- “Từ MIB tới thông tin hệ thống”
- “Truyền dữ liệu sau khi kết nối”

Không dùng heading nửa Việt nửa Anh nếu có cách viết tự nhiên hơn mà vẫn chính xác.
