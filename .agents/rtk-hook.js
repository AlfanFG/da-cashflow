const fs = require('fs');

let input = '';

process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input);
    const args = payload.toolCall.args;
    let cmd = args.CommandLine;
    
    // Pastikan ada command, dan belum diawali dengan rtk
    if (cmd && !cmd.trim().startsWith('rtk ')) {
      // Kita tambahkan rtk di depannya
      cmd = `rtk ${cmd}`;
      
      console.log(JSON.stringify({
        decision: "allow",
        overwrite: {
          CommandLine: cmd
        }
      }));
    } else {
      // Biarkan berjalan normal jika sudah pakai rtk atau kosong
      console.log(JSON.stringify({ decision: "allow" }));
    }
  } catch (e) {
    // Jika ada error parsing, biarkan command berjalan tanpa intervensi
    console.log(JSON.stringify({ decision: "allow" }));
  }
});
