export default function makeCompilerEnv() {
  global.print = function(txt) {
    process.stdout.write(txt.toString());
  };

  global.println = function(txt) {
    console.log(txt);
  };
}
