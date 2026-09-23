# VietWireless Curriculum

Đây là source of truth mô tả learning graph. Số bài, part, slug và trạng thái machine-readable nằm trong src/data/curriculum.js.

## Nguyên tắc tổ chức

- Đi từ tổng quan tới cụ thể.
- Mỗi phần lớn phải cho người đọc biết hệ thống đang cố giải quyết vấn đề gì trước khi zoom vào channel, signal, procedure hoặc formula.
- Không mở một chủ đề 5G NR bằng định nghĩa rời rạc nếu người đọc chưa biết khái niệm đó xuất hiện ở bước nào trong hành trình của UE.
- Các bài foundation có thể chạm qua nhiều khái niệm để tạo bản đồ. Bài sau phải zoom sâu, không viết lại cùng nội dung.
- Internal links phải đi theo learning graph này.
- Từ Bài 19 trở đi phải tuân thủ docs/LESSON_CONTRACT.md.
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

19. UE bật nguồn thì chuyện gì xảy ra?
20. Synchronization là gì?
21. SSB là gì?
22. PSS
23. SSS và Physical Cell ID
24. Fine timing và frequency synchronization
25. PBCH DM-RS
26. PBCH
27. MIB

Bài 19 phải là overview. Nó kể toàn bộ flow từ power on tới khi UE đọc được MIB, chưa đi sâu sequence, bit field hay mapping chi tiết.

Mỗi bài deep-dive ở Part III phải trả lời:
- UE đang biết gì trước bước này?
- UE đang tìm/đo/giải mã cái gì?
- output của bước này là gì?
- output đó được dùng ở bước tiếp theo như thế nào?
- bước này chưa giải quyết được điều gì?

## Phần IV: Từ MIB tới thông tin hệ thống

28. CORESET#0 và SearchSpace#0
29. PDCCH là gì?
30. DCI cơ bản
31. SIB1 nằm ở đâu?
32. SIB1
33. Cell selection và camping

Bài 28 phải mở bằng system transition MIB → CORESET#0/SearchSpace#0 → PDCCH → PDSCH → SIB1 trước khi đi sâu cấu trúc CORESET.

## Phần V: UE bắt đầu truy nhập mạng

34. Random Access tổng quan
35. PRACH là gì?
36. PRACH preamble
37. SSB ↔ PRACH occasion
38. Random Access Response
39. Timing Advance
40. Msg3 và Msg4
41. RRC Setup

Phải phân biệt rõ:
- downlink synchronization: UE align receiver của mình với downlink của gNB;
- uplink timing alignment: gNB đo uplink timing và dùng Timing Advance để điều chỉnh thời điểm UE phát.

Bài 34 là overview của random access.

## Phần VI: Truyền dữ liệu sau khi kết nối

42. Bức tranh PHY khi UE đã connected
43. PDSCH
44. PUSCH
45. PUCCH
46. DMRS
47. Channel estimation
48. Equalization
49. HARQ
50. MCS và link adaptation
51. MIMO và beamforming

Bài 42 là overview. Nó phải cho thấy scheduling/control/data/reference-signal loop trước khi tách từng channel.

## Phần VII: Receiver trong thực tế

52. Timing offset
53. Carrier Frequency Offset
54. CFO estimation và correction
55. Sampling Frequency Offset
56. Phase noise
57. EVM

Bài 52 phải mở bằng một receiver không lý tưởng: timing, carrier, sampling clock và phase đều có thể lệch. Không trình bày từng impairment như các hiện tượng độc lập hoàn toàn.

## Phần VIII: 5G NR qua vệ tinh (NTN)

58. Từ terrestrial NR tới NTN
59. Propagation delay
60. Doppler trong NTN
61. NTN synchronization
62. NTN Timing Advance
63. SIB19
64. Ephemeris và satellite position
65. NTN Random Access
66. Moving satellite, beam và handover

Bài 58 là overview. Phải chỉ rõ giả định nào của terrestrial NR bị stress khi link đi qua satellite: propagation delay, Doppler, moving geometry, timing và mobility.

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

Foundation 1–18 đã có page. Ưu tiên tiếp theo:

1. Bài 19 · UE bật nguồn thì chuyện gì xảy ra?
2. Bài 20 · Synchronization là gì?
3. Bài 21 · SSB là gì?
4. Bài 22 · PSS
5. Bài 23 · SSS và Physical Cell ID
6. Bài 24 · Fine timing và frequency synchronization
7. Bài 25 · PBCH DM-RS
8. Bài 26 · PBCH
9. Bài 27 · MIB
10. Sau đó mới đi tiếp MIB → SIB1 → Random Access.

Không viết batch dài mà giảm dần độ sâu. Sau mỗi 2–3 bài, so lại depth, terminology, source quality và visual consistency trước khi tiếp tục.
