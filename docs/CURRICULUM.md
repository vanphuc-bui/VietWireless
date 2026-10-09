# VietWireless Curriculum

Đây là source of truth mô tả learning graph. Số bài, part, slug và trạng thái machine-readable nằm trong src/data/curriculum.js.

## Nguyên tắc tổ chức

- Đi từ tổng quan tới cụ thể.
- Mỗi phần lớn phải cho người đọc biết hệ thống đang cố giải quyết vấn đề gì trước khi zoom vào channel, signal, procedure hoặc formula.
- Không mở một chủ đề 5G NR bằng định nghĩa rời rạc nếu người đọc chưa biết khái niệm đó xuất hiện ở bước nào trong hành trình của UE.
- Các bài foundation có thể chạm qua nhiều khái niệm để tạo bản đồ. Bài sau phải zoom sâu, không viết lại cùng nội dung.
- Internal links phải đi theo learning graph này.
- Từ Bài 20 trở đi phải tuân thủ docs/LESSON_CONTRACT.md.
- Tên part trên homepage, /hoc/ và file này phải khớp src/data/curriculum.js.

## Trục kể chuyện chính

Information
→ tín hiệu
→ sampling
→ amplitude / frequency / phase
→ complex number
→ I/Q
→ Fourier / DFT / FFT
→ modulation
→ RF
→ channel
→ noise / multipath
→ correlation
→ OFDM
→ resource grid
→ 5G numerology
→ tổng quan 5G NR radio + core protocol
→ UE power on
→ synchronization
→ SSB
→ PSS / SSS
→ PBCH / MIB
→ CORESET#0 / SearchSpace#0
→ PDCCH / SIB1
→ PRACH
→ Timing Advance
→ RRC connection
→ connected-mode PHY
→ receiver impairments
→ NTN.

## Phần I: Nền tảng tín hiệu

1. Signal là gì?
2. Sampling, aliasing và Nyquist
3. Amplitude, frequency và phase
4. Số phức và phasor
5. I/Q và complex baseband
6. Miền thời gian và miền tần số
7. Fourier, DFT và FFT
8. Modulation: BPSK → QPSK → QAM

Bài 01 là bản đồ nền tảng. Các bài 02 đến 08 zoom sâu vào từng khái niệm đã được chạm qua.

## Phần II: Từ tín hiệu tới liên kết vô tuyến

9. Baseband → RF → antenna
10. Wireless channel
11. Noise, SNR và EVM
12. Multipath và delay spread
13. Correlation
14. OFDM: bức tranh tổng thể
15. IFFT/FFT trong OFDM
16. Cyclic Prefix
17. Resource grid
18. Numerology trong 5G NR

Bài 14 là overview của OFDM. Các bài 15–18 tách từng cơ chế quan trọng.

## Phần III: UE bật lên và tìm cell 5G

19. Toàn cảnh quy trình kết nối 5G NR
20. UE bật nguồn thì chuyện gì xảy ra?
21. Synchronization là gì?
22. SSB là gì?
23. PSS
24. SSS và Physical Cell ID
25. Fine timing và frequency synchronization
26. PBCH DM-RS
27. PBCH
28. MIB

Bài 19 đặt khung 5G SA end-to-end: SSB/MIB → SIB1 → PRACH/RRC → NAS Registration → PDU Session, với 44 bước minh họa được chia thành tám giai đoạn. Số bước không mang tính chuẩn tắc; phân biệt PHY/MAC, RRC và NAS.

Bài 20 phải là overview. Nó kể toàn bộ flow từ power on tới khi UE đọc được MIB, chưa đi sâu sequence, bit field hay mapping chi tiết.

Mỗi bài deep-dive ở Part III phải trả lời:
- UE đang biết gì trước bước này?
- UE đang tìm/đo/giải mã cái gì?
- output của bước này là gì?
- output đó được dùng ở bước tiếp theo như thế nào?
- bước này chưa giải quyết được điều gì?

## Phần IV: Từ MIB tới thông tin hệ thống

29. CORESET#0 và SearchSpace#0
30. PDCCH là gì?
31. DCI cơ bản
32. SIB1 nằm ở đâu?
33. SIB1
34. Cell selection và camping

Bài 29 phải mở bằng system transition MIB → CORESET#0/SearchSpace#0 → PDCCH → PDSCH → SIB1 trước khi đi sâu cấu trúc CORESET.

## Phần V: UE bắt đầu truy nhập mạng

35. Random Access tổng quan
36. PRACH là gì?
37. PRACH preamble
38. SSB ↔ PRACH occasion
39. Random Access Response
40. Timing Advance
41. Msg3 và Msg4
42. RRC Setup

Phải phân biệt rõ:
- downlink synchronization: UE align receiver của mình với downlink của gNB;
- uplink timing alignment: gNB đo uplink timing và dùng Timing Advance để điều chỉnh thời điểm UE phát.

Bài 35 là overview của random access.

## Phần VI: Truyền dữ liệu sau khi kết nối

43. Bức tranh PHY khi UE đã connected
44. PDSCH
45. PUSCH
46. PUCCH
47. DMRS
48. Channel estimation
49. Equalization
50. HARQ
51. MCS và link adaptation
52. MIMO và beamforming

Bài 43 là overview. Nó phải cho thấy scheduling/control/data/reference-signal loop trước khi tách từng channel.

## Phần VII: Receiver trong thực tế

53. Timing offset
54. Carrier Frequency Offset
55. CFO estimation và correction
56. Sampling Frequency Offset
57. Phase noise
58. EVM

Bài 53 phải mở bằng một receiver không lý tưởng: timing, carrier, sampling clock và phase đều có thể lệch. Không trình bày từng impairment như các hiện tượng độc lập hoàn toàn.

## Phần VIII: 5G NR qua vệ tinh (NTN)

59. Từ terrestrial NR tới NTN
60. Propagation delay
61. Doppler trong NTN
62. NTN synchronization
63. NTN Timing Advance
64. SIB19
65. Ephemeris và satellite position
66. NTN Random Access
67. Moving satellite, beam và handover

Bài 59 là overview. Phải chỉ rõ giả định nào của terrestrial NR bị stress khi link đi qua satellite: propagation delay, Doppler, moving geometry, timing và mobility.

Với NTN, source discipline theo docs/SOURCE_POLICY.md là bắt buộc; phải kiểm tra Release 17/18 phù hợp trước khi publish.

## Template cho một phần mới

Khi bắt đầu một part:
1. xác định system transition của part;
2. viết overview hoặc ít nhất một opening section cho thấy end-to-end flow;
3. giải thích problem trước tên channel/signal/procedure;
4. chỉ ra input hiện có và điều receiver/UE chưa biết;
5. tách các bài chuyên sâu theo operation hoặc state transition;
6. mỗi bài phải link về bản đồ/overview và tới bước tiếp theo;
7. nếu liên quan 3GPP, thêm specification layer;
8. dùng docs/LESSON_TEMPLATE.md khi tạo page mới.

## Ưu tiên triển khai tiếp

Foundation 1–18 đã có page. Tiếp theo, bài tổng quan mới đặt trước các bài phân tích PHY:

1. Bài 19 · Toàn cảnh quy trình kết nối 5G NR
2. Bài 20 · UE bật nguồn thì chuyện gì xảy ra?
3. Bài 21 · Synchronization là gì?
4. Bài 22 · SSB là gì?
5. Bài 23 · PSS
6. Bài 24 · SSS và Physical Cell ID
7. Bài 25 · Fine timing và frequency synchronization
8. Bài 26 · PBCH DM-RS
9. Bài 27 · PBCH
10. Bài 28 · MIB
11. Sau đó mới đi tiếp MIB → SIB1 → Random Access.

Không viết batch dài mà giảm dần độ sâu. Sau mỗi 2–3 bài, so lại depth, terminology, source quality và visual consistency trước khi tiếp tục.
